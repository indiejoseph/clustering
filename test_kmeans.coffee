'use strict'

_ = require 'lodash'

idf       = require './data/idf'
docWords  = require './data/doc_words'
doc2kls   = require './data/doc2kls'
documents = require './data/docs'
TFIDF     = require './lib/tfidf'

##########################################
# K-Means
##########################################

kmeans = require 'node-kmeans'

K = 12
features = 12

# Get features
tfidf = new TFIDF idf
docs  = {}

for doc in _.take(_.shuffle(Object.keys(documents)), 100)
  counts  = docWords[doc]
  weights = tfidf.calculate(docWords[doc])
  sortTerms = {}
  sortTerms[w] = counts[w]  for w of weights

  docs[doc] =
    weights : weights
    terms   : sortTerms

# Create the data 2D-array (vectors) describing the data
vectors = new Array()
words   = []

for i in [0...100]
  vectors[i] = []
  key = Object.keys(docs)[i]
  doc = docs[key]

  for j in [0...features]
    word = Object.keys(doc.terms)[j]

    if word in words
      idx = words.indexOf word
    else
      idx = words.length
      words.push word

    vectors[i][idx] = doc.terms[word]

# fill up
for i in [0...100]
  max = vectors[vectors.length-1].length
  for j in [0...max]
    vectors[i][j] = (vectors[i][j] or 0)

# Clustering
kmeans.clusterize vectors, {k: K}, (err, res) ->
  console.error err  if err
  console.log('%o',res)
