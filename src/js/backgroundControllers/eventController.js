const period = 6 * 60 * 60 * 1000;

export const eventController = (fauna) => {

    const autoFetchUpdates = () => {
        // setInterval(fauna.fetchUpdates, period)
    }

    autoFetchUpdates();

    return  {
        autoFetchUpdates
    }
}