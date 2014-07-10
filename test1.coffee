'use strict'

fs = require 'fs'
path = require 'path'

DS_STORE     = '.DS_Store'
corpusFolder = './documents'
klassFolders = fs.readdirSync corpusFolder

doc2kls  = {}
docWords = {}
idf = []

for klass in klassFolders when klass isnt DS_STORE

  docs = fs.readdirSync path.join(corpusFolder, klass)

  for doc in docs when doc isnt DS_STORE
    doc2kls[doc] = klass
    docWords[doc] = {}

    content = fs.readFileSync path.join(corpusFolder, klass, doc), 'utf8'
    words = content.split ' '

    # count dict by doc
    for word in words
      docWords[doc][word] = (docWords[doc][word]+1 or 1)

    # count idf
    for word in Object.keys(docWords)
      idf[word] = (idf[word]+1 or 1)
