const emailer = angular.module('emailer', [
  'btford.socket-io',
  'angular-md5',
]);

emailer.factory('Socket', ['socketFactory', socketFactory => socketFactory()]);

emailer.controller('mainController', [
  '$scope',
  'Socket',
  'md5',
  ($scope, Socket, md5) => {
    Socket.connect();

    $scope.emails = [];
    $scope.loggedin = false;

    Socket.on('err', (err) => {
      alert(`Sorry, smth went wrong: ${err.toString()}`);
    });

    Socket.on('login', (user, emails) => {
      $scope.$apply(() => {
        $scope.loggedin = user.email;
        $scope.emails = emails;
      });
    });

    Socket.on('emailsent', (email) => {
      $scope.$apply(() => {
        $scope.emails.push(email);
      });
    });

    Socket.on('emaildeleted', (index) => {
      $scope.$apply(() => {
        $scope.emails.splice(index, 1);
      });
    });

    $scope.register = () => {
      if ($scope.password !== $scope.password2) {
        alert('Passwords don\'t match');
        return;
      }
      Socket.emit('register', { email: $scope.email, password: md5.createHash($scope.password) });
    };
    $scope.login = () => {
      Socket.emit('login', { email: $scope.email, password: md5.createHash($scope.password) });
    };
    $scope.logout = () => {
      $scope.loggedin = false;
      $scope.emails = [];
    };
    $scope.create = () => {
      Socket.emit('createemail', { to: $scope.to, subject: $scope.subject, text: $scope.text || '\n' });
    };
    $scope.delete = (index) => {
      Socket.emit('deleteemail', $scope.emails[index], index);
    };
  }]);
