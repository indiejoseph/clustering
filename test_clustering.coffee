'use strict'

_    = require 'lodash'
path = require 'path'
fs   = require 'fs'

idf       = require './data/idf'
docWords  = require './data/doc_words'
doc2kls   = require './data/doc2kls'
documents = require './data/docs'
TFIDF     = require './lib/tfidf'

_cmp = ( x, y ) -> (if x > y then 1 else (if x < y then -1 else 0))

_cosineSimilarity = (d1, d2) ->
  return _dot(d1, d2) / (_norm(d1) * _norm(d2))

sum = (arr) -> arr.reduce (a, b) -> a + b

_norm = (d) ->
  _sum = 0.0
  for i in [0...d.length]
    _sum += Math.pow(d[i], 2)
  return Math.sqrt(_sum)

_dot = (d1, d2) ->
  _sum = 0.0
  for i in [0...d1.length]
    _sum += d1[i] * d2[i]
  return _sum

_similarity = (c1, c2) ->
  avg = 0.0
  sim = 0.0

  for i in [0...c1.length]
    for j in [0...c2.length]
      terms = {}
      terms[t] = ((c1[i][t] or 0) + (c2[j][t] or 0)) for t in (_.union Object.keys(c1[i]), Object.keys(c2[j]))
      sortedTerms = {}

      # sort and get union features
      for key, k in (Object.keys(terms).sort (a, b) -> _cmp terms[b], terms[a])
        sortedTerms[key] = terms[key]
        if k >= numOfFeatures-1
          break

      # get features from document in cluster
      c1Count = ((c1[i][key] or 0) for key of sortedTerms)
      c2Count = ((c2[j][key] or 0) for key of sortedTerms)

      sim += _cosineSimilarity(c1Count, c2Count)

  return sim/(c1.length * c2.length)

### Clustering ###

tfidf         = new TFIDF idf
docs          = {}
numOfFeatures = 20

# stop words
stopWordFile = path.join __dirname, 'stopwords.dic'
stopWords = fs.readFileSync stopWordFile, 'utf8'
stopWords = (word for word in stopWords.split('\n'))

# get documents
for doc in _.take(_.shuffle(Object.keys(documents)), 100)
  counts  = docWords[doc]
  weights = tfidf.calculate(docWords[doc])
  sortTerms = {}
  max = -Infinity

  for w of weights when w not in stopWords
    if counts[w] > max
      max = counts[w]
    sortTerms[w] = counts[w]

  for w of sortTerms
    sortTerms[w] = sortTerms[w]/max

  # assign TF-IDF
  docs[doc] = weights

clustering = (docs, threshold=0.5) ->
  clusters   = []
  clusterDoc = []

  for key, i in Object.keys(docs)
    clusters[i] = [docs[key]]
    clusterDoc[i] = key

  for i in [0...clusters.length]
    maxSim = -Infinity
    maxIdx = -1
    for j in [i+1...clusters.length]
      sim = _similarity(clusters[i], clusters[j])

      if sim > threshold
        console.log sim
        if sim > maxSim
          maxIdx = j
          maxSim = sim
    # if has similar cluster, merge clusters
    if ~maxIdx
      clusters[maxIdx] = _.union clusters[maxIdx], clusters[i]
      delete clusters[i]

  return [clusters, clusterDoc]

[clusters, clusterDoc] = clustering docs
total = 0
results = []

for i in [0...clusters.length] when clusters[i]
  results[i] = []
  for doc in clusters[i]
    results[i].push doc2kls[clusterDoc[i]]
  total++

console.log results, total
