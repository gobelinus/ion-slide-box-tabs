var slidingTabsDirective = angular.module("ionic").directive('ionSlideTabs', ['$timeout', '$compile', '$interval', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', '$ionicGesture', function($timeout, $compile, $interval, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicGesture) {
    return {
        require: "^ionSlideBox",
        restrict: 'A',
        link: function(scope, element, attrs, parent) {

            var ionicSlideBoxDelegate;
            var ionicScrollDelegate;
            var ionicScrollDelegateID;

            var slideTabs;
            var indicator;

            var slider;
            var tabsBar;
            var lastScrollX;

            var options = {
                "slideTabsScrollable": true
            }


            var scrollTo = function(x, targetIndex) {
                // scrolling to same position, ignore.
                if(x === lastScrollX)
                    return;

                // save scroll X.
                lastScrollX = x;

                // if diff. between current and target X is less than
                // say 50% of window width, we don't need to scroll
                // this doesn't work perfectly till target tab's position
                // is considered.
                var thresholdX = window.innerWidth * 0.5;
                var scrollPosition = ionicScrollDelegate.getScrollPosition();
                // console.info(scrollPosition.left);
                if(Math.abs(x - scrollPosition.left) > thresholdX) {
                    ionicScrollDelegate.scrollTo(x, 0, true);
                }

                // console.info('scrollTo', x, targetIndex, Date.now());
            }

            var init = function () {

                if(angular.isDefined( attrs.slideTabsScrollable ) && attrs.slideTabsScrollable === "false" ) {
                    options.slideTabsScrollable = false;
                }

                var tabItems = '<li ng-repeat="(key, value) in tabs" ng-click="onTabTabbed($event, {{key}})" class="slider-slide-tab" ng-bind-html="value"></li>';

                if(options.slideTabsScrollable) {

                    if(angular.isDefined(attrs.scrollDelegateHandle) && attrs.scrollDelegateHandle) {
                      ionicScrollDelegateID = attrs.scrollDelegateHandle;
                    }
                    else {
                      ionicScrollDelegateID = "ion-slide-tabs-handle-" + Math.floor((Math.random() * 10000) + 1);
                    }
                    tabsBar = angular.element('<ion-scroll delegate-handle="' + ionicScrollDelegateID + '" class="slidingTabs" direction="x" scrollbar-x="false"><ul>' + tabItems + '</ul></ion-scroll>');

                }
                else {

                    tabsBar = angular.element('<div class="slidingTabs"><ul>' + tabItems + '</ul> <div class="tab-indicator-wrapper"><div class="tab-indicator"></div></div> </div>');

                }


                slider = angular.element(element);

                var compiled = $compile(tabsBar);
                slider.parent().prepend(tabsBar);
                compiled(scope);

                //get Tabs DOM Elements
                indicator = angular.element(tabsBar[0].querySelector(".tab-indicator"));

                //get the slideBoxHandle
                var slideHandle = slider.attr('delegate-handle');
                var scrollHandle = tabsBar.attr('delegate-handle');

                ionicSlideBoxDelegate = $ionicSlideBoxDelegate;
                if (slideHandle) {
                    ionicSlideBoxDelegate = ionicSlideBoxDelegate.$getByHandle(slideHandle);
                }


                if(options.slideTabsScrollable) {

                    ionicScrollDelegate = $ionicScrollDelegate;
                    if (scrollHandle) {
                        ionicScrollDelegate = ionicScrollDelegate.$getByHandle(scrollHandle);
                    }

                }


                addEvents();
                setTabBarWidth();
                slideToCurrentPosition();
            };

            var addEvents = function() {

                ionic.onGesture("dragleft", scope.onSlideMove ,slider[0]);
                ionic.onGesture("dragright", scope.onSlideMove ,slider[0]);
                ionic.onGesture("release", scope.onSlideChange ,slider[0]);

            }

            var setTabBarWidth = function() {
                // console.info('setTabBarWidth', Date.now());

                if( !angular.isDefined(slideTabs) || slideTabs.length == 0 ) {
                    return false;
                }

                tabsList = tabsBar.find("ul");
                var tabsWidth = 0;

                angular.forEach(slideTabs, function (currentElement,index) {

                    var currentLi = angular.element(currentElement);
                    tabsWidth += currentLi[0].offsetWidth;
                });

                if(options.slideTabsScrollable) {
                    // console.warn(Date.now());
                    angular.element(tabsBar[0].querySelector(".scroll")).css("width", tabsWidth + 1 + "px");
                    // console.warn(Date.now());
                }
                else {

                    slideTabs.css("width",tabsList[0].offsetWidth / slideTabs.length + "px");
                }

                // slideToCurrentPosition();

            };

            var addTabTouchAnimation = function(event,currentElement) {
                console.info('addTabTouchAnimation', Date.now());

                var ink = angular.element(currentElement[0].querySelector(".ink"));

                if( !angular.isDefined(ink) || ink.length == 0 ) {
                    ink = angular.element("<span class='ink'></span>");
                    currentElement.prepend(ink);
                }


                ink.removeClass("animate");

                if(!ink.offsetHeight && !ink.offsetWidth)
                {

                    d = Math.max(currentElement[0].offsetWidth, currentElement[0].offsetHeight);
                    ink.css("height", d + "px");
                    ink.css("width", d + "px");
                }

                x = event.offsetX - ink[0].offsetWidth / 2;
                y = event.offsetY - ink[0].offsetHeight / 2;


                ink.css("top", y +'px');
                ink.css("left", x +'px');
                ink.addClass("animate");
            }

            var slideToCurrentPosition = function() {
                // console.info('slideToCurrentPosition', Date.now());
                if( !angular.isDefined(slideTabs) || slideTabs.length == 0 ) {
                    return false;
                }

                var targetSlideIndex = ionicSlideBoxDelegate.currentIndex();

                var targetTab = angular.element(slideTabs[targetSlideIndex]);
                var targetLeftOffset = targetTab.prop("offsetLeft");
                var targetWidth = targetTab[0].offsetWidth;

                // console.info('slideToCurrentPosition: 1', Date.now());

                // indicator.css({
                //     "-webkit-transition-duration": "50ms",
                //     "-webkit-transform":"translate(" + targetLeftOffset + "px,0px)",
                //     "width": targetWidth + "px"
                // });

                // console.info('slideToCurrentPosition: 2', Date.now());

                if (options.slideTabsScrollable && ionicScrollDelegate) {
                    var scrollOffset = 40;
                    scrollTo(targetLeftOffset - scrollOffset, targetSlideIndex);
                }

                slideTabs.removeClass("tab-active");
                targetTab.addClass("tab-active");
                // console.info('slideToCurrentPosition: 4', Date.now());
            }


            var setIndicatorPosition = function (currentSlideIndex, targetSlideIndex, position, slideDirection) {

                // console.info('setIndicatorPosition', Date.now());
                // var targetTab = angular.element(slideTabs[targetSlideIndex]);

                // var currentTab = angular.element(slideTabs[currentSlideIndex]);
                // var targetLeftOffset = targetTab.prop("offsetLeft");

                // var currentLeftOffset = currentTab.prop("offsetLeft");
                // var offsetLeftDiff = Math.abs(targetLeftOffset - currentLeftOffset);


                // if( currentSlideIndex == 0 && targetSlideIndex == ionicSlideBoxDelegate.slidesCount() - 1 && slideDirection == "right" ||
                //     targetSlideIndex == 0 && currentSlideIndex == ionicSlideBoxDelegate.slidesCount() - 1 && slideDirection == "left" ) {
                //     return;
                // }

                // // console.info('setIndicatorPosition 1', Date.now());
                // var targetWidth = targetTab[0].offsetWidth;
                // var currentWidth = currentTab[0].offsetWidth;
                // var widthDiff = targetWidth - currentWidth;

                // var indicatorPos = 0;
                // var indicatorWidth = 0;

                // if (currentSlideIndex > targetSlideIndex) {

                //     indicatorPos = targetLeftOffset - (offsetLeftDiff * (position - 1));
                //     indicatorWidth = targetWidth - ((widthDiff * (1 - position)));

                // }
                // else if (targetSlideIndex > currentSlideIndex) {

                //     indicatorPos = targetLeftOffset + (offsetLeftDiff * (position - 1));
                //     indicatorWidth = targetWidth + ((widthDiff * (position - 1)));

                // }

                // console.info('setIndicatorPosition 2', Date.now());
                // indicator.css({
                //     "-webkit-transition-duration":"0ms",
                //     "-webkit-transform":"translate(" + indicatorPos + "px,0px)",
                //     "width": indicatorWidth + "px"
                // });

                // console.info('setIndicatorPosition 3', Date.now());

                // if (options.slideTabsScrollable && ionicScrollDelegate) {
                //     var scrollOffset = 40;
                //     var scrollTo = indicatorPos - scrollOffset;
                //     ionicScrollDelegate.scrollTo(scrollTo ,0,false);
                //     console.info('scroll To: ', scrollTo, Date.now());
                //     // console.info('setIndicatorPosition 4', Date.now());
                // }

            }

            scope.onTabTabbed = function(event, index) {
                if (angular.isUndefined(attrs.ionSlideTouchAnimation) || attrs.ionSlideTouchAnimation !== "false" ) {
                  addTabTouchAnimation(event, angular.element(event.currentTarget) );
                }
                slideToCurrentPosition();
                ionicSlideBoxDelegate.slide(index, 0);
            }

            scope.tabs = [];

            scope.addTabContent = function ($content) {

                scope.tabs.push($content);
                scope.$apply();

                $timeout(function() {
                    slideTabs = angular.element(tabsBar[0].querySelector("ul").querySelectorAll(".slider-slide-tab"));
                    slideToCurrentPosition();
                    setTabBarWidth()
                })

            }

            scope.onSlideChange = function (slideIndex) {
                slideToCurrentPosition();
            };

            scope.onSlideMove = function () {
                var scrollDiv = slider[0].getElementsByClassName("slider-slide");

                var currentSlideIndex = ionicSlideBoxDelegate.currentIndex();
                var currentSlide = angular.element(scrollDiv[currentSlideIndex]);
                var currentSlideLeftOffset = currentSlide.css('-webkit-transform').replace(/[^0-9\-.,]/g, '').split(',')[0];

                var targetSlideIndex = (currentSlideIndex + 1) % scrollDiv.length;
                if (currentSlideLeftOffset > slider.prop("offsetLeft")) {
                    targetSlideIndex = currentSlideIndex - 1;
                    if (targetSlideIndex < 0) {
                        targetSlideIndex = scrollDiv.length - 1;
                    }
                }
                var targetSlide = angular.element(scrollDiv[targetSlideIndex]);

                var position = currentSlideLeftOffset / slider[0].offsetWidth;
                var slideDirection = position > 0 ? "right":"left";
                position = Math.abs(position);

                setIndicatorPosition(currentSlideIndex, targetSlideIndex, position, slideDirection);
            };

            init();
        },
        controller: ['$scope',function($scope) {
            this.addTab = function($content) {
                $timeout(function() {
                    if($scope.addTabContent) {
                        $scope.addTabContent($content);
                    }
                });
            }
        }]
    };
}]);

slidingTabsDirective.directive('ionSlideTabLabel', [ function() {
    return {
        require: "^ionSlideTabs",
        link: function ($scope, $element, $attrs, $parent) {
            $parent.addTab($attrs.ionSlideTabLabel);
        }
    }
}]);
