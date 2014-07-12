'use strict'

d1 = [0.1, 0.2, 0.3, 0.4, 0.1, 0.2, 0.11]
d2 = [0.3, 0.1, 0.1, 0.3, 0.3, 0.3, 0.12]

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

console.log cosineSimilarity(d1, d2)
