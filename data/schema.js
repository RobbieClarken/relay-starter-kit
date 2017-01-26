import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql'

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay'


import {
  Game,
  HidingSpot,
  checkHidingSpotForTreasure,
  getGame,
  getHidingSpot,
  getHidingSpots,
  getTurnsRemaining,
} from './database'


const { nodeInterface, nodeField } = nodeDefinitions(

  globalId => {

    const { type, id } = fromGlobalId(globalId)
    if (type === 'Game') { return getGame(id) }
    else if (type === 'HidingSpot') { return getHidingSpot(id) }
    else { return null }

  },

  obj => {

    if (obj instanceof Game) { return gameType }
    else if (obj instanceof HidingSpot) { return hidingSpotType }
    else { return null }

  }

)


const gameType = new GraphQLObjectType({

  name: 'Game',
  description: 'A treasure search game',
  interfaces: [nodeInterface],

  fields: () => ({

    id: globalIdField('Game'),

    hidingSpots: {
      type: hidingSpotConnection,
      args: connectionArgs,
      description: 'Places where treasure might be hidden',
      resolve: (game, args) => connectionFromArray(getHidingSpots(), args),
    },

    turnsRemaining: {
      type: GraphQLInt,
      description: 'The number of turns a player has left to find the treasure',
      resolve: () => getTurnsRemaining(),
    },

  }),

})


const hidingSpotType = new GraphQLObjectType({

  name: 'HidingSpot',
  description: 'A place where you might find treasure',
  interfaces: [nodeInterface],

  fields: () => ({

    id: globalIdField('HidingSpot'),

    hasBeenChecked: {
      type: GraphQLBoolean,
      description: 'True if this spot has already been checked for treasure',
      resolve: hidingSpot => hidingSpot.hasBeenChecked,
    },

    hasTreasure: {

      type: GraphQLBoolean,
      description: 'True if this hiding spot holds treasure',

      resolve: (hidingSpot) => {
        if (hidingSpot.hasBeenChecked) { return hidingSpot.hasTreasure }
        else { return null }
      },
    },

  }),

})


const { connectionType: hidingSpotConnection } =
  connectionDefinitions({name: 'HidingSpot', nodeType: hidingSpotType})


const queryType = new GraphQLObjectType({

  name: 'Query',

  fields: () => ({

    node: nodeField,

    game: {
      type: gameType,
      resolve: () => getGame(),
    },

  }),

})


const CheckHidingSpotForTreasureMutation = mutationWithClientMutationId({

  name: 'CheckHidingSpotForTreasure',

  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },

  outputFields: {

    hidingSpot: {
      type: hidingSpotType,
      resolve: ({ localHidingSpotId }) => getHidingSpot(localHidingSpotId),
    },

    game: {
      type: gameType,
      resolve: () => getGame(),
    },

  },

  mutateAndGetPayload: ({ id }) => {
    const localHidingSpotId = fromGlobalId(id).id
    checkHidingSpotForTreasure(localHidingSpotId)
    return {localHidingSpotId}
  },

})


var mutationType = new GraphQLObjectType({

  name: 'Mutation',

  fields: () => ({
    checkHidingSpotForTreasure: CheckHidingSpotForTreasureMutation,
  })

})


export const Schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
})
