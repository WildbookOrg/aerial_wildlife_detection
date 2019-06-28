/*
    Helper classes responsible for displaying the available label classes on the screen.

    2019 Benjamin Kellenberger
*/


class LabelClass {
    constructor(classID, properties, changeListener) {
        this.classID = classID;
        this.name = (properties['name']==null? '[Label Class '+this.classID+']' : properties['name']);
        this.index = properties['index'];
        this.color = (properties['color']==null? window.getDefaultColor(this.index) : properties['color']);
        this.changeListener = changeListener;
    }

    getMarkup() {
        var self = this;
        var name = this.name;
        if(this.index >= 0 && this.index < 9) {
            name = '(' + (this.index+1) + ') ' + this.name;
        }
        var markup = $('<div class="label-class-legend col-sm-3 legend-inactive" id="labelLegend_'+this.classID+'" style="background:' + this.color + '"><span class="label-text">'+name+'</span></div>');

        // setup click handler to activate label class
        markup.click(function() {
            self.changeListener.setActiveClass(self);
        });

        // listener for keypress if in [1, 9]
        if(this.index >= 0 && this.index < 9) {
            $(window).keyup(function(event) {
                try {
                    var key = parseInt(String.fromCharCode(event.which));
                    if(key == self.index+1) {
                        self.changeListener.setActiveClass(self);
                    }
                } catch {
                    return;
                }
            });
        }

        return markup;
    }
}


class LabelClassHandler {
    constructor(classLegendDiv) {
        this.classLegendDiv = classLegendDiv;
        this._setupLabelClasses();
        this._buildLegend();

        this.setActiveClass(this.labelClasses[Object.keys(this.labelClasses)[0]]);
    }

    _setupLabelClasses() {
        // creates LabelClass instances in numeric order according to the class index (TODO: allow customizable order?)
        this.labelClasses = {};

        // this.order = [];
        // this.order.sort(function(a, b) {
        //     if(a['index'] < b['index']) {
        //         return -1;
        //     } else if(a['index'] > b['index']) {
        //         return 1;
        //     } else {
        //         return 0;
        //     }
        // });

        // iterate over label classes
        var counter = 0;
        for(var c in window.classes) {
            if(window.classes[c]['index'] == null) {
                window.classes[c]['index'] = counter++;
            }
            var nextClass = new LabelClass(c, window.classes[c], this);
            this.labelClasses[c] = nextClass;
        }
    }

    _buildLegend() {
        // this.order.length = 0;
        $(this.classLegendDiv).empty();
        for(var key in this.labelClasses) {
            var lcInstance = this.labelClasses[key];
            var markup = $(lcInstance.getMarkup());
            $(this.classLegendDiv).append(markup);
        }

        //TODO: order
    }

    getActiveClass() {
        return this.activeClass;
    }

    getActiveClassID() {
        return (this.activeClass == null? null : this.activeClass['classID']);
    }

    getActiveClassName() {
        return (this.activeClass == null? null : this.activeClass['name']);
    }

    getActiveColor() {
        return (this.activeClass == null? null : this.activeClass['color']);
    }

    getColor(classID) {
        return this.labelClasses[classID]['color'];
    }

    getColor(classID, defaultColor) {
        try {
            return this.labelClasses[classID]['color'];
        } catch {
            return defaultColor;
        }
    }

    getName(classID) {
        return (classID == null || !this.labelClasses.hasOwnProperty(classID)? null : this.labelClasses[classID]['name']);
    }

    setActiveClass(labelClassInstance) {
        // reset style of currently active class
        if(this.activeClass != null) {
            $('#labelLegend_'+this.activeClass.classID).toggleClass('legend-inactive');
        }

        this.activeClass = labelClassInstance;

        // apply style to new active class
        if(this.activeClass != null) {
            $('#labelLegend_'+this.activeClass.classID).toggleClass('legend-inactive');
        }
    }
}