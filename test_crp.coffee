'use strict'

data = [
  [0.1, 0.2, 0.3, 0.4, 0.1, 0.0, 0.1]
  [0.0, 0.0, 0.1, 0.1, 0.0, 0.3, 0.1]
  [0.3, 0.1, 0.2, 0.0, 0.1, 0.0, 0.5]
  [0.1, 0.2, 0.1, 0.3, 0.2, 0.3, 0.0]
  [0.0, 0.1, 0.3, 0.0, 0.0, 0.3, 0.2]
  [0.1, 0.2, 0.5, 0.5, 0.1, 0.3, 0.5]
  [0.1, 0.0, 0.3, 0.0, 0.2, 0.1, 0.3]
]

cosineSimilarity = (d1, d2) ->
  return dot(d1, d2) / (norm(d1) * norm(d2))

sum = (arr) -> arr.reduce (a, b) -> a + b

norm = (d) ->
  _sum = 0.0
  for i in [0...d.length]
    _sum += Math.pow(d[i], 2)
  return Math.sqrt(_sum)

dot = (d1, d2) ->
  _sum = 0.0
  for i in [0...d1.length]
    _sum += d1[i] * d2[i]
  return _sum

_mergeVec = (d1, d2) ->
  vec = []
  for i in [0...d1.length]
    vec.push (d1[i] + d2[i] / 2)
  return vec

crp = (docs) ->
  clusterVec = [docs[0]]
  clusterIdx = [[0]]
  N = docs.length
  pnew = 1.0/(1+clusterVec.length)

  for i in [1...N]
    maxSim = -Infinity
    maxIdx = 0
    doc = docs[i]

    for j in [0...clusterVec.length]
      sim = cosineSimilarity(doc, clusterVec[j])
      if sim > maxSim
        maxIdx = j
        maxSim = sim
      if maxSim > pnew
        if Math.random() > pnew
          clusterVec[clusterVec.length] = doc
          clusterIdx[clusterVec.length] = [i]
          pnew = 1.0/(1+clusterVec.length)
        continue
    clusterVec[maxIdx] = if clusterVec[maxIdx] then _mergeVec clusterVec[maxIdx], doc else doc
    clusterIdx[maxIdx] = []  if maxIdx not in clusterIdx
    clusterIdx[maxIdx].push i
    console.log maxIdx, maxSim, clusterIdx[maxIdx], clusterIdx

  return clusterIdx

console.log crp(data)
