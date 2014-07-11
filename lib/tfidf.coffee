'use strict'

_cmp = ( x, y ) -> (if x > y then 1 else (if x < y then -1 else 0))

class TFIDF

  constructor: ( @idf ) ->

  calculate: ( terms ) ->
    max   = -Infinity # max term count
    tfidf = {}

    for key, count of terms when count > max
      max = count

    for key, count of terms
      tf = count / max
      tfidf[key] = tf * (@idf[key] or 1)

    # sort by weight
    sortedKeys = Object.keys(tfidf).sort (x, y) -> _cmp tfidf[y], tfidf[x]
    sorted = {}

    for key in sortedKeys
      sorted[key] = tfidf[key]

    return sorted


module.exports = TFIDF
