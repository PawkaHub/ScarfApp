"use strict";

var manipulatorCount = 0;
var CARD_POOL_SIZE = 3;

//Default Card Positions
var defaultPosition = 0;
var position = 0;

//Default Card Width
var cardWidth;
var cardEdge;
var cardMargin = 4;

//Card Divides
var firstDivide;
var secondDivide;
var thirdDivide;

//Card Modulus
var firstModulus;
var secondModulus;
var thirdModulus;

//Card Loops
var firstLoop;
var secondLoop;
var thirdLoop;

//Card Bounds
var cardRightBounds = 0;
var cardLeftBounds = 0;
var constraintPosition = 0;
var overdragCoefficient = 0.75;
var violationDelta = 0;

//Animatable Card Positions
var firstPosition = defaultPosition;
var secondPosition = defaultPosition;
var thirdPosition = defaultPosition;

//The data index for keeping track of where we are in the card stack
var firstIndex = 0;
var secondIndex = 0;
var thirdIndex = 0;

var firstIndexModifier = 2;
var secondIndexModifier = 1;
var thirdIndexModifier = 0;

//Card Holders
var firstCard;
var secondCard;
var thirdCard;

function beginEdit(card, variable) {
    if (card) {
        card._solver.beginEdit(variable, c.Strength.strong);
    }
}

function shouldLoop(num) {
    //console.log('num', num);
    if (num >= 1 && num <= 3) {
        return true;
    }
    return false;
}

function sign(x) {
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
}

// This is a wrapper over a cassowary variable. It will create an edit session for it when dragged and listen for violations of motion constraints.
function Manipulator(variable, domObject, axis) {
    this._variable = variable;
    this._solver = null;
    this._axis = axis;
    this._context = null;

    this._motion = null;
    this._animation = null;
    this._name = 'manipulator-' + variable.name + '-' + (++manipulatorCount);

    this._hitConstraint = null;
    this._constraintCoefficient = 1;

    this._position = 0;
    this._velocity = 0;
    this._constrainedRight = false;
    this._constrainedLeft = false;

    var self = this;

    // There are three places that a variable gets a value from in here:
    //  1. touch manipulation (need to apply constraint when in violation)
    //  2. animation from velocity.
    //  3. animation from constraint.
    this._motionState = {
        editing: false,
        // Manipulation from touch
        dragging: false,
        dragStart: 0,
        dragDelta: 0,
        // Animation from velocity (which the finger imparted)
        velocityAnimation: null,
        velocityAnimationPosition: 0,
        velocityAnimationVelocity: 0,
        // Animation from constraint (either from velocity animation, or from drag end).
        constraintAnimation: null,
        constraintAnimationPosition: 0,
        constraintAnimationVelocity: 0,
        constraintAnimationConstraint: null, // the constraint we're animating for.
    };

    addTouchOrMouseListener(domObject, {
        onTouchStart: function() {
            //console.log('touch', self._variable);
            self._motionState.dragging = true;
            self._motionState.dragStart = position;
            self._motionState.dragDelta = 0;
            self._update();
        },
        onTouchMove: function(dx, dy) {
            var delta = (axis == 'x') ? dx : dy;
            self._motionState.dragDelta = delta;
            self._update();
        },
        onTouchEnd: function(dx, dy, v) {
            var velocity = (axis == 'x') ? v.x : v.y;
            self._motionState.dragging = false;
            self._position = position;
            if (self._motionContext) self._motionContext.update();
            console.log('onTouchEnd', velocity);
            self._createAnimation(velocity);
        }
    });
}
// This method is called by the MotionContext when this manipulator is added to it.
Manipulator.prototype._setMotionContext = function(motionContext) {
    this._motionContext = motionContext;
    this._solver = motionContext.solver();
    // Add a stay to the variable we're going to manipulate.
    this._solver.add(new c.StayConstraint(this._variable, c.Strength.medium, 0));
    if (this._motionContext._boxes.length === CARD_POOL_SIZE) {
        //Force a manipulator update once all the cards are loaded to kick off the default cards display
        this._update(true);
    }
}

Manipulator.prototype.handleCards = function(position) {
    //console.log('initial', thirdPosition, secondPosition, firstPosition, position, this._position, this._constrainedRight);
    thirdPosition = position; //Compute the position normally
    //Check for if the second card should be dragged along with the third card
    //console.log('after', thirdPosition);
    if (thirdPosition > cardEdge) {
        secondPosition = position - cardEdge;
    }

    //Check for if the first card should be dragged along with the second card
    if (secondPosition > cardEdge) {
        //Reset the second card's position to be in the middle of the stack
        firstPosition = secondPosition - cardEdge;
    }

    firstDivide = firstPosition / cardEdge;
    secondDivide = secondPosition / cardEdge;
    thirdDivide = thirdPosition / cardEdge;

    //Calculate if the divide is a modulus of an odd number, if it's an odd number than we know that we need to be setting the card's position to be static. If it's not, we know that we should be animating the card minus the original normalized delta
    firstModulus = firstDivide % 3;
    secondModulus = secondDivide % 3;
    thirdModulus = thirdDivide % 3;

    firstLoop = shouldLoop(firstModulus);
    secondLoop = shouldLoop(secondModulus);
    thirdLoop = shouldLoop(thirdModulus);

    //console.log('=================================================================');

    //console.log('distances', cardEdge, thirdPosition);

    //console.log('before positions', thirdPosition, secondPosition, firstPosition, position, this._position, this._motionState.constraintAnimationPosition);

    //console.log('divides', firstDivide, secondDivide, thirdDivide);

    //console.log('modulus', firstModulus, secondModulus, thirdModulus);

    //console.log('firstModulus',firstModulus);
    //console.log('secondModulus',secondModulus);
    //console.log('thirdModulus', thirdModulus);

    //Handle thirdCard zIndex when we haven't looped through the stack yet (We set the topCard to be at the top of the stack)
    if (firstModulus >= 0 && firstModulus <= 1 && secondModulus >= 0 && secondModulus <= 1 && thirdModulus >= 0 && thirdModulus <= 1 && !thirdCard.scope.$looped) {
        //console.log('topCard is at the top and will get sent to the bottom after bottomCard, reset the zIndex to show topCard at the top');
        thirdCard.element().style.zIndex = 1;
        secondCard.element().style.zIndex = 0;
        firstCard.element().style.zIndex = 0;

        //console.log('bottomCard is at the bottom', thirdIndex);

        //Set card's dataIndexModifier for tying into and displaying data returned from the server
        thirdIndexModifier = 0;
    }

    //Handle secondCard zIndex when we haven't looped through the stack yet (We set the middleCard to be at the top of the stack)
    if (firstModulus >= 0 && firstModulus <= 1 && secondModulus >= 0 && secondModulus <= 1 && thirdModulus >= 1 && thirdModulus <= 2 && !secondCard.scope.$looped) {
        //console.log('middleCard is at the top and will get sent to the bottom after topCard, reset the zIndex to show middleCard at the top')
        //console.log('topCard is at the bottom', thirdIndex);
        thirdCard.element().style.zIndex = -1;
        secondCard.element().style.zIndex = 1;
        firstCard.element().style.zIndex = 0;

        //Set card's dataIndexModifier for tying into and displaying data returned from the server
        thirdIndexModifier = 2;
        secondIndexModifier = 1;
    }

    //Handle firstCard zIndex when we haven't looped through the stack yet (We set the bottomCard to be at the top of the stack)
    if (firstModulus >= 0 && firstModulus <= 1 && secondModulus >= 1 && secondModulus <= 2 && thirdModulus >= 2 && thirdModulus <= 3 && !firstCard.scope.$looped) {
        //console.log('bottomCard is at the top and will get sent to the bottom after middleCard, reset the zIndex to show bottomCard at the top');
        thirdCard.element().style.zIndex = 0;
        secondCard.element().style.zIndex = -1;
        firstCard.element().style.zIndex = 1;

        //Set card's dataIndexModifier for tying into and displaying data returned from the server
        thirdIndexModifier = 1;
        secondIndexModifier = 3;
        firstIndexModifier = 2;

        //console.log('unlooped middleCard is at the bottom', thirdIndex);
    }

    //Handle thirdCard zIndex when we've looped through the stack (We set the bottomCard to be at the bottom of the stack)
    if (firstModulus >= 1 && firstModulus <= 2 && secondModulus >= 2 && secondModulus <= 3 && thirdModulus >= 0 && thirdModulus <= 1) {
        //Check for if bottomCard is on the bottom
        //console.log('topCard is at the top and will be sent to the bottom after bottomCard');
        //console.log('looped bottomCard is at the bottom');
        thirdCard.element().style.zIndex = 1;
        secondCard.element().style.zIndex = 0;
        firstCard.element().style.zIndex = -1;

        //Set card's dataIndexModifier for tying into and displaying data returned from the server
        thirdIndexModifier = 0;
        firstIndexModifier = 4;
    }

    //Handle firstCard zIndex when we've looped through the stack (We set the middleCard to be at the bottom of the stack)
    if (firstModulus >= 0 && firstModulus <= 1 && secondModulus >= 1 && secondModulus <= 2 && thirdModulus >= 2 && thirdModulus <= 3 && firstCard.scope.$looped) {
        //console.log('bottomCard is at the top and will be sent to the bottom after middleCard');
        //console.log('looped middleCard is at the bottom');
        thirdCard.element().style.zIndex = 0;
        secondCard.element().style.zIndex = -1;
        firstCard.element().style.zIndex = 1;

        //Set card's dataIndexModifier for tying into and displaying data returned from the server
        thirdIndexModifier = 0;
    } else if (firstModulus >= 2 && firstModulus <= 3 && secondModulus >= 0 && secondModulus <= 1 && thirdModulus >= 1 && thirdModulus <= 2) {
        //console.log('looped middleCard is at the top');
        thirdCard.element().style.zIndex = -1;
        secondCard.element().style.zIndex = 1;
        firstCard.element().style.zIndex = 0;

        //Set card's dataIndexModifier for tying into and displaying data returned from the server
        thirdIndexModifier = 2;
        secondIndexModifier = 1;
    }

    thirdIndex = Math.floor(thirdDivide) + thirdIndexModifier;
    secondIndex = Math.floor(secondDivide) + secondIndexModifier;
    firstIndex = Math.floor(firstDivide) + firstIndexModifier;

    if (thirdIndex < 0) {
        thirdIndex = 0;
    }
    if (secondIndex < 0) {
        secondIndex = 0;
    }
    if (firstIndex < 0) {
        firstIndex = 0;
    }

    //We apply the dataIndexes separately so that we don't have flickering when switching between different card data contexts
    if (firstModulus >= 0 && firstModulus <= 1 && secondModulus >= 0 && secondModulus <= 1 && thirdModulus >= 0 && thirdModulus <= 1 && !thirdCard.scope.$looped) {
        if (thirdIndex !== thirdCard.scope.$dataIndex) {
            //console.log('thirdCard dataIndex changed', thirdIndex, thirdCard.scope.$dataIndex);
            thirdCard.scope.$dataIndex = 0;
        }
    }

    if (firstModulus >= 0 && firstModulus <= 1 && secondModulus >= 0 && secondModulus <= 1 && thirdModulus >= 1 && thirdModulus <= 2 && !secondCard.scope.$looped) {
        if (thirdIndex !== thirdCard.scope.$dataIndex) {
            thirdCard.scope.$dataIndex = thirdIndex;
        }

        if (secondIndex !== thirdCard.scope.$dataIndex) {
            secondCard.scope.$dataIndex = secondIndex;
        }
    }

    if (firstModulus >= 0 && firstModulus <= 1 && secondModulus >= 1 && secondModulus <= 2 && thirdModulus >= 2 && thirdModulus <= 3 && !firstCard.scope.$looped) {
        if (secondIndex !== secondCard.scope.$dataIndex) {
            secondCard.scope.$dataIndex = secondIndex;
        }

        if (firstIndex !== firstCard.scope.$dataIndex) {
            firstCard.scope.$dataIndex = firstIndex;
        }
    }

    if (firstModulus >= 1 && firstModulus <= 2 && secondModulus >= 2 && secondModulus <= 3 && thirdModulus >= 0 && thirdModulus <= 1) {
        if (thirdIndex !== thirdCard.scope.$dataIndex) {
            thirdCard.scope.$dataIndex = thirdIndex;
        }
        if (firstIndex !== firstCard.scope.$dataIndex) {
            firstCard.scope.$dataIndex = firstIndex;
        }
    }

    if (firstModulus >= 0 && firstModulus <= 1 && secondModulus >= 1 && secondModulus <= 2 && thirdModulus >= 2 && thirdModulus <= 3 && firstCard.scope.$looped) {
        if (thirdIndex !== thirdCard.scope.$dataIndex) {
            thirdCard.scope.$dataIndex = thirdIndex;
        }
    } else if (firstModulus >= 2 && firstModulus <= 3 && secondModulus >= 0 && secondModulus <= 1 && thirdModulus >= 1 && thirdModulus <= 2) {
        if (thirdIndex !== thirdCard.scope.$dataIndex) {
            thirdCard.scope.$dataIndex = thirdIndex;
        }
        if (secondIndex !== secondCard.scope.$dataIndex) {
            secondCard.scope.$dataIndex = secondIndex;
        }
    }

    //console.log('indexes', thirdIndex, secondIndex, firstIndex);

    //console.log('shouldLoops', firstLoop, secondLoop, thirdLoop);

    //console.log('thirdLoop', thirdPosition, thirdModulus, thirdLoop);
    //console.log('secondLoop',secondPosition,secondModulus,secondLoop);
    //console.log('firstLoop', firstPosition, firstModulus, firstLoop);

    //Handle the bottom card
    if (firstLoop) {
        firstPosition = defaultPosition;
        firstCard.scope.$looped = true;
    } else {
        //console.log('bottomCard should be bottomCard!');
        if (secondLoop || thirdLoop) {
            //In this scenario, we only need to minus the cardEdge if we've already overlapped the cards once, so we check to see if the firstPosition has passed three cardEdges in one drag already. If it hasn't, we don't do anything to the position and let it calculate itself as if would normally
            if ((firstPosition - cardEdge * 2) > 0) {
                var calc = firstPosition - (cardEdge * Math.floor(firstDivide));
                firstPosition = calc;
                //console.log('LOOP: bottomCard should be bottomCard!', firstDivide);
            } else {
                firstCard.scope.$looped = false;
                //console.log('bottomCard is at beginning of stack!', firstPosition);
            }
        }
    }

    //Handle the middle card
    if (secondLoop) {
        secondPosition = defaultPosition;
        secondCard.scope.$looped = true;
        //console.log('LOOP: middleCard should be middleCard!', secondDivide);
    } else {
        //Calculate the second card's position based on whether the first and thirdCard is currently looping or not. If it's not, let's just leave it alone and let the default position calculations handle the position, unless the firstLoop is the only thing happening right now, in which case we lock the card's position so that it doesn't get warped away by anything.
        if (firstLoop || thirdLoop) {
            var calc = secondPosition - (cardEdge * Math.floor(secondDivide));
            secondPosition = calc;
        }
        secondCard.scope.$looped = false;
    }

    //Handle the top card
    if (thirdLoop) {
        thirdPosition = defaultPosition;
        thirdCard.scope.$looped = true;
        //console.log('LOOP: topCard should be bottomCard!', thirdDivide);
    } else {
        //Calculate the third card's position based on whether the firstCard is currently looping or not. If it's not, let's just leave it alone and let the default position calculations handle the position
        //console.log('topCard should become topCard!', thirdPosition, firstLoop, secondLoop, thirdLoop);
        if (firstLoop) {
            var calc = thirdPosition - (cardEdge * Math.floor(thirdDivide));
            thirdPosition = calc;
            //console.log('bottomCard is set as topCard! topCard will translate normally', thirdDivide);
        } else {
            //Set the card to be back at the top of the stack
            thirdCard.scope.$looped = false;
            //Check if the thirdPosition is negative, and if it is drag the other cards back with it
            if (thirdPosition < cardRightBounds) {
                this._constrainedRight = true;
                this._constrainedPosition = thirdPosition;
                firstPosition = thirdPosition;
                secondPosition = thirdPosition;
                console.log('stillConstrained', thirdPosition, cardRightBounds);
            } else {
                this._constrainedRight = false;
                this._constrainedPosition = 0;
                firstPosition = 0;
                secondPosition = 0;
            }
        }
    }

    //Check to see if we're at an end card
    if (thirdCard.scope.$last) {
        if (thirdPosition > cardLeftBounds) {
            console.log('thirdCard is the last card and should rebound to the beginning', thirdPosition, cardLeftBounds, this._constrainedRight);
            this._constrainedLeft = true;
            this._constrainedPosition = thirdPosition;
            firstPosition = thirdPosition;
            secondPosition = thirdPosition;
        } else if (!this._constrainedRight) {
            console.log('thirdCard is the last card and should rebound to the beginning', thirdPosition, this._constrainedRight);
            this._constrainedLeft = false;
            firstPosition = 0;
            secondPosition = 0;
        }
    }
    if (secondCard.scope.$last) {
        if (secondPosition > cardLeftBounds) {
            console.log('secondCard is the last card and should rebound to the beginning', thirdPosition, secondPosition, firstPosition, cardLeftBounds);
            this._constrainedLeft = true;
            this._constrainedPosition = secondPosition;
            if (thirdCard.scope.$looped) {
                thirdPosition = secondPosition;
            }
            //thirdPosition = secondPosition;
            if (!secondCard.scope.$looped) {
                firstPosition = secondPosition;
            }
        } else if (!this._constrainedRight) {
            console.log('secondCard is the last card and should reset itself', thirdPosition, secondPosition, firstPosition);
            this._constrainedLeft = false;
            //thirdPosition = 0;
            if (!secondCard.scope.$looped) {
                firstPosition = 0;
            }
        }
    }
    if (firstCard.scope.$last) {
        if (firstPosition > cardLeftBounds) {
            console.log('firstCard is the last card and should rebound to the beginning', thirdPosition, secondPosition, firstPosition);
            this._constrainedLeft = true;
            this._constrainedPosition = firstPosition;
            //if (thirdCard.scope.$looped) {
            //    console.log('resetThirdCard');
            //    thirdPosition = firstPosition;
            //}
            //if (secondCard.scope.$looped) {
            //    console.log('resetSecondCard');
            //    secondPosition = firstPosition;
            //}
        } else {
            console.log('firstCard is the last card and should reset itself', thirdPosition, secondPosition, firstPosition);
            this._constrainedLeft = false;
            //if (!thirdCard.scope.$looped) {
            //    thirdPosition = 0;
            //}
            //if (!secondCard.scope.$looped) {
            //    secondPosition = 0;
            //}
        }
    }

    //console.log('after positions', thirdPosition, secondPosition, firstPosition, position, this._position, this._motionState.constraintAnimationPosition);
}
Manipulator.prototype.name = function() {
    return this._name;
}
Manipulator.prototype.variable = function() {
    return this._variable;
}
Manipulator.prototype.createMotion = function(x, v) {
    var m = new Friction(0.1); // 0.001
    m.set(x, v);
    return m;
}
Manipulator.prototype._cancelAnimation = function(key) {
    if (!this._motionState[key]) return;
    this._motionState[key].cancel();
    this._motionState[key] = null;
}
Manipulator.prototype._update = function(init) {
    // Handles animations based on what state we're in:
    // 1. Dragging: we set the variable to the value specified and apply some damping if we're in violation of a constraint.
    // 2. Animating: we have some momentum from a drag, and we're applying the values of an animation to the variable. We need to react if we violate a constraint.
    //  3. Constraint animating: we already violated a constraint and now we're animating back to a non-violating position.
    //  4. Nothing is going on, we shouldn't be editing.
    var self = this;

    //Initialize the card handler variables
    if (init) {
        //Cards for infinite looping
        firstCard = this._motionContext._boxes[0];
        secondCard = this._motionContext._boxes[1];
        thirdCard = this._motionContext._boxes[2];

        cardWidth = firstCard.right.value; //The width of the cards
        cardEdge = cardWidth + cardMargin; //For detecting if we should be pulling the previous card in the stack with us as we swipe

        firstCard.scope.$dataIndex = firstIndexModifier;
        secondCard.scope.$dataIndex = secondIndexModifier;
        thirdCard.scope.$dataIndex = thirdIndexModifier;
    }

    //console.log('constraints', this._constrainedRight, this._constrainedLeft);

    //console.log('before', position, self._position);

    if (this._motionState.dragging) {
        // Handle any user based dragging.

        // Kill any animations we already have.
        this._cancelAnimation('velocityAnimation');
        this._cancelAnimation('constraintAnimation');
        this._motionState.velocityAnimationVelocity = 0;
        this._motionState.constraintAnimationVelocity = 0;

        //Persist the current position between dragging sessions, and apply accordingly
        //console.log('before position', position, self._position);
        position = self._position + (self._motionState.dragDelta + 0.005);
        //console.log('after position', position, self._position);

        //Apply some friction when dragging past a constraint
        if (self._constrainedRight) {
            position -= position * overdragCoefficient;
            //console.log('constrainedRight', position, self._position);
        }
        if (self._constrainedLeft) {
            //position -= position * overdragCoefficient;
            //console.log('constrainedLeft', position, self._position);
        }
        //console.log('dragging', position, self._position);
        self.handleCards(position);
    } else if (self._constrainedLeft || self._constrainedRight) {
        //If the cards are out of constrained, animate it back. If we're not dragging, trigger an animation to bounce us back into bounds
        self._cancelAnimation('velocityAnimation');
        //position = self._position + (self._motionState.dragDelta + 0.05);
        console.log('trigger constraintAnimation', position, self._position);
        position = self._position;
        self.handleCards(position);
        /*thirdPosition = self._motionState.constraintAnimationPosition;
        secondPosition = self._motionState.constraintAnimationPosition;
        thirdPosition = self._motionState.constraintAnimationPosition;*/
        /*thirdPosition = self._position - thirdPosition;
        secondPosition = self._position - secondPosition;
        firstPosition = self._position - firstPosition;*/
    } else if (self._motionState.velocityAnimation) {
        //console.log('trigger velocityAnimation', thirdPosition, secondPosition, firstPosition, position, this._position, this._motionState.velocityAnimationPosition);
        //Handle velocity transferred from a flick
        position = self._motionState.velocityAnimationPosition;
        self.handleCards(position);
    }

    //console.log('after', position, self._position);

    //First Card Position
    beginEdit(firstCard, firstCard.x);
    firstCard._solver.suggestValue(firstCard.x, firstPosition);
    firstCard._solver.endEdit(firstCard.x);

    //Second Card Position
    beginEdit(secondCard, secondCard.x);
    secondCard._solver.suggestValue(secondCard.x, secondPosition);
    secondCard._solver.endEdit(secondCard.x);

    //Third Card Position
    beginEdit(thirdCard, thirdCard.x);
    thirdCard._solver.suggestValue(thirdCard.x, thirdPosition);
    thirdCard._solver.endEdit(thirdCard.x);

    if (this._motionContext) this._motionContext.update();
}
Manipulator.prototype._createAnimation = function(velocity) {
    // Can't animate if we're being dragged.
    if (this._motionState.dragging) return;

    var self = this;
    var violationDelta;
    var motionConstraint;
    var motion;

    //Set the motion constraints for when we're being constrained on the right side of the card stack (first card in the stack)
    if (this._constrainedRight) {
        // Figure out how far we have to go to be out of a constraint violation. Because we use a linear constraint solver to surface violations we only need to remember the coefficient of a given violation.
        violationDelta = this._position / this._constraintCoefficient;
        motionConstraint = new MotionConstraint(cardEdge, '>=', 0);
        motion = motionConstraint.createMotion(this._constrainedPosition);
        motion.setEnd(0, velocity);
        //console.log('constrainedRight animation', this._position, violationDelta, motion);
    }

    //Set the motion constraints for when we're being constrained on the left side of the card stack (last card in the stack)
    if (this._constrainedLeft) {
        violationDelta = this._position / this._constraintCoefficient;
        motionConstraint = new MotionConstraint(0, '>=', 0);
        //We have to calculate what the card's actual motion translation would be here, irregardless of the user's current position in the card stack as the motionConstraint has no context of how far along in the stack the user is.
        //console.log('createConstrainedLeftMotion', this._position, this._constrainedPosition);
        motion = motionConstraint.createMotion(this._constrainedPosition);
        //console.log('setEnd', this._position - violationDelta, position, this._position, violationDelta, this._constrainedPosition);
        motion.setEnd(this._position - violationDelta, velocity);
        //console.log('constrainedLeft end position', this._position, this._position - violationDelta);
        //console.log('constrainedLeft animation', this._position, violationDelta, velocity);
    }

    //Only create a motion animation if we're actually in a constraint
    if (this._constrainedRight || this._constrainedLeft) {
        //Create the constrained animation
        this._motionState.constraintAnimationConstraint = motionConstraint;

        this._motionState.constraintAnimation = animation(motion,
            function() {
                self._motionState.constraintAnimationPosition = motion.x();
                //Get the endpoint by subtracting the constrained position from the current position
                //console.log('before running constraintAnimation', position, self._position, self._constrainedPosition);
                //self._position = position - self._constrainedPosition
                //self._position = (self._position - self._constrainedPosition) + motion.x();
                //self._position = self._constrainedPosition - motion.x();
                //self._position = motion.x();
                if (self._constrainedRight) {
                    self._position = motion.x();
                    //Prevent the cards from rebounding past 0
                    if (self._position > 0) {
                        self._position = 0;
                    }
                }
                if (self._constrainedLeft) {
                    self._position = position - self._constrainedPosition + motion.x();
                    //Normalize the position so that when we're animating out of a constraint we don't have anything that's not a whole number
                    console.log('XXX: Normalize self._position', self._position);
                }
                //console.log('after running constraintAnimation', self._position, motion.x());
                self._motionState.constraintAnimationVelocity = motion.dx(); // unused.
                self._update();

                if (motion.done()) {
                    self._cancelAnimation('constraintAnimation');
                    self._motionState.constraintAnimationConstraint = null;
                    self._constrainedRight = false;
                    self._constrainedLeft = false;
                    //console.log('constraint done', self._position);
                    self._update();
                }
            });
        return;
    }

    //console.log('Animate out of constraint!', this._motionState.constraintAnimation, this._motionState.constraintAnimationPosition);
    //Create a normal velocity animation
    var motion = this.createMotion(self._position, velocity);
    //if (motion.done()) return;

    this._cancelAnimation('velocityAnimation');
    this._cancelAnimation('constraintAnimation');

    //console.log('create velocityAnimation', velocity);

    this._motionState.velocityAnimation = animation(motion,
        function() {
            self._motionState.velocityAnimationPosition = motion.x();
            self._position = motion.x();
            //Normalize the self._position so that we're not on any position that would not allow for a card to be fully displayed
            console.log('XXX: normalize self._position velocityAnimationPosition', self._position);
            self._motionState.velocityAnimationVelocity = motion.dx();
            //console.log('opa', self._position, self._motionState.velocityAnimationPosition, self._motionState.velocityAnimation);
            //Snap back if we've hit a left or right constraint while animating through our velocity
            if (self._constrainedRight || self._constrainedLeft) {
                self._cancelAnimation('velocityAnimation');
                self._update();
                self._createAnimation(self._position);
            }
            //console.log('running velocityAnimation', position, self._position, self._constrainedPosition);
            self._update();
            // If we've hit the end then cancel ourselves and update the system which will end the edit.
            if (motion.done()) {
                //console.log('ended!');
                self._cancelAnimation('velocityAnimation');
                self._update();
                if (self._constrainedRight || self._constrainedLeft) {
                    //console.log('cancel velocity and create constraint animation', self._position, self._velocity);
                    self._createAnimation(self._position);
                }
            }
        });
}

//This is not really used in our implementation right now, but we might make use of it later
Manipulator.prototype.hitConstraints = function(violations) {
    return;
}
Manipulator.prototype.animating = function() {
    if (this._motionState.dragging) return false;
    return !!this._motionState.velocityAnimation;
}
Manipulator.prototype.editing = function() {
    return this._motionState.editing;
}
Manipulator.prototype.cancelAnimations = function() {
    this._cancelAnimation('velocityAnimation');
    this._cancelAnimation('constraintAnimation');
    this._constrainedRight = false;
    this._update();
}