const getuToolsLite = () => {
    var utoolsLite = Object.assign({}, _.cloneDeep(utools))
        // if (utools.isDev()) return utoolsLite
    const dbBlackList = ['db', 'dbStorage', 'removeFeature', 'setFeature', 'onDbPull']
    const payBlackList = ['fetchUserServerTemporaryToken', 'isPurchasedUser', 'openPurchase', 'getUserServerTemporaryToken', 'openPayment', 'fetchUserPayments']
    const etcBlackList = ['onPluginEnter', 'onPluginOut', 'onMainPush', 'createBrowserWindow']
    _.concat(dbBlackList, payBlackList, etcBlackList).forEach(item => {
        delete utoolsLite[item]
    })
    Object.freeze(utoolsLite)
    return utoolsLite
}

module.exports = getuToolsLite
