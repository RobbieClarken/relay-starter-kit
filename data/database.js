// Model types
export class Game {}
export class HidingSpot {}

// Mock data
const game = new Game()
game.id = '1'

const hidingSpots = []

;(() => {

  // Pick random spot
  const indexOfSpotWithTreasure = Math.floor(Math.random() * 9)

  let hidingSpot
  for (let i = 0; i < 9; i++) {
    hidingSpot = new HidingSpot()
    hidingSpot.id = `${i}`
    hidingSpot.hasTreasure = (i === indexOfSpotWithTreasure)
    hidingSpot.hasBeenChecked = false
    hidingSpots.push(hidingSpot)
  }

})()

let turnsRemaining = 3

export const checkHidingSpotForTreasure = id => {

  // shortcut if hiding spot has been found already
  if (hidingSpots.some(hs => hs.hasTreasure && hs.hasBeenChecked)) { return }

  turnsRemaining--
  const hidingSpot = getHidingSpot(id)
  hidingSpot.hasBeenChecked = true

}

export const getHidingSpot = id => hidingSpots.find(hs => hs.id === id)

export const getGame = () => game

export const getHidingSpots = () => hidingSpots

export const getTurnsRemaining = () => turnsRemaining
