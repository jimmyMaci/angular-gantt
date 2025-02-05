'use strict';
gantt.directive('ganttHeaderColumns', [function() {
    return {
        restrict: 'E',
        require: '^ganttHeader',
        transclude: true,
        replace: true,
        templateUrl: function(tElement, tAttrs) {
            if (tAttrs.templateUrl === undefined) {
                return 'template/default.headerColumns.tmpl.html';
            } else {
                return tAttrs.templateUrl;
            }
        },
        controller: ['$scope', '$element', function($scope, $element) {
            $scope.gantt.header.columns.$element = $element;

            $scope.gantt.api.directives.raise.new('ganttHeaderColumns', $scope, $element);
            $scope.$on('$destroy', function() {
                $scope.gantt.api.directives.raise.destroy('ganttHeaderColumns', $scope, $element);
            });
        }]
    };
}]);
