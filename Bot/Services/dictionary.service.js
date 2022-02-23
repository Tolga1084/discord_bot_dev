const { MongoServerError } = require('mongodb');
const db = process.env['AppDatabase']
const getMongoClient = require("../_helpers/getMongoClient.js")

// check if the word exists in the dictionary.
// firstly, looks for exact matches; if not, then looks for base matches where (â == a)

async function dictQuery (word) {

    const mongoClient = await getMongoClient();

    let alternated = false // if matched with strength 2, no need to add the word to usedWords

    try {
        let res = await mongoClient.db(db).collection("TR_dictionary2").findOne({madde: word}, {
            collation: {
                locale: 'tr',
                strength: 2
            }

        });

        // dont look for base matches if the word already contains 'â', to prevent for example "lâle" returning "lale"
        if ((res === null) && (! word.includes('â') ) ) {
            res = await mongoClient.db(db).collection("TR_dictionary2").findOne({madde: word}, {
                collation: {
                    locale: 'tr',
                    strength: 1
                }
            })
            alternated = word // add the word to usedWords to prevent for example "kağıt" being used repeatedly, since "kağıt" registers only as "kâğıt" to usedWords.
        }
        return {
            wordQuery: res,
            alternated
        };

    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR dictQuery: ${error}`); // special case for some reason
        }
        throw error
    }
}

module.exports = dictQuery

/* INDEXES
{
    v: 2,
    key: { madde: 1 },
    name: 'madde_col_str1',
    background: false,
    collation: {
      locale: 'tr',
      caseLevel: false,
      caseFirst: 'off',
      strength: 1,
      numericOrdering: false,
      alternate: 'non-ignorable',
      maxVariable: 'punct',
      normalization: false,
      backwards: false,
      version: '57.1'
    }
  },
  {
    v: 2,
    key: { madde: 1 },
    name: 'madde_col_str2',
    background: false,
    collation: {
      locale: 'tr',
      caseLevel: false,
      caseFirst: 'off',
      strength: 2,
      numericOrdering: false,
      alternate: 'non-ignorable',
      maxVariable: 'punct',
      normalization: false,
      backwards: false,
      version: '57.1'
    }
  }
}*/