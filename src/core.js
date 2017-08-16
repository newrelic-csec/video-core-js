import Log from './log'

/**
 * Static class that sums up core functionalities of the library.
 * @static
 */
class Core {
  /**
   * Add a tracker to the system. Trackers added will start reporting its events to NR's backend.
   *
   * @param {(Emitter|Tracker)} tracker
   */
  static addTracker (tracker) {
    if (tracker.on && tracker.emit) {
      trackers.push(tracker)
      tracker.on('*', eventHandler)
      tracker.emit('TRACKER_READY', tracker.getAttributes())
    } else {
      Log.error('Tried to load a non-tracker.', tracker)
    }
  }

  /**
   * Disposes and remove given tracker. Removes its listeners.
   *
   * @param {Tracker} tracker Tracker to remove.
   */
  static removeTracker (tracker) {
    tracker.off('*', eventHandler)
    tracker.dispose()
    let index = trackers.indexOf(tracker)
    if (index !== -1) trackers.splice(index, 1)
  }

  /**
   * Returns the array of trackers.
   *
   * @returns {Tracker[]} Array of trackers.
   */
  static getTrackers () {
    return trackers
  }

  /**
   * Sends given event. Uses newrelic Browser Agent.
   * @param {String} event Event to send.
   * @param {Object} data Data associated to the event.
   */
  static send (event, data) {
    if (typeof newrelic !== 'undefined' && newrelic.addPageAction) {
      newrelic.addPageAction(event, data)
    } else {
      if (!isErrorShown) {
        Log.error(
          'newrelic.addPageAction() is not available.',
          'In order to use NewRelic Video you will need New Relic Browser Agent.'
        )
        isErrorShown = true
      }
    }
  }

  /**
   * Sends an error event. This may be used for external errors launched by the app, the network or
   * any external factor. Note that errors within the player are normally reported with
   * tracker.sendError, so this method should not be used to report those.
   *
   * @param {object} att attributes to be sent along the error.
   */
  static sendError (att) {
    Core.send('ERROR', att)
  }
}

let trackers = []
let isErrorShown = false

/**
 * Logs and sends given event.
 *
 * @private
 * @param {Event} e Event
 */
function eventHandler (e) {
  let data = cleanData(e.data)
  if (Log.level <= Log.Levels.DEBUG) {
    Log.notice('Sent', e.type, data)
  } else {
    Log.notice('Sent', e.type)
  }
  Core.send(e.type, data)
}

/**
 * Cleans given object, removing all items with value === null.
 * @private
 * @param {Object} data Data to clean
 * @returns {Object} Cleaned object
 */
function cleanData (data) {
  let ret = {}
  for (let i in data) {
    if (data[i] !== null && typeof data[i] !== 'undefined') ret[i] = data[i]
  }
  return ret
}

export default Core
