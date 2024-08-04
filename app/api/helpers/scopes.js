
module.exports = {
  scopes: {
    'default': {
      scopes: ['url.create', 'token.delete', 'token.enable']
    },
    'url.create': {
      scopes: ['url.create']
    },
    'token.delete': {
      scopes: ['token.delete']
    },
    'token.create': {
      scopes: ['token.create']
    },
    'token.enable': {
      scopes: ['token.enable']
    },
    'token.scope.grant': {
      scopes: ['token.scope.grant']
    },
    'token.scope.revoke': {
      scopes: ['token.scope.revoke']
    },

  }
}