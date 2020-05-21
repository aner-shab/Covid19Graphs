// Modified from the following sample code: https://dc-js.github.io/dc.js/resizing/resizing-row.html 

// for a getter/setter property name and a value,
// return a function that wraps a function so that the property
// is set to the new value, the wrapped function is run on the chart,
// and the property value is then restored

// also applies to arrays of charts, and children of composite charts
const restore_getset = (property, value) => f => c => {
    if(Array.isArray(c))
        c.forEach(restore_getset(property, value)(f));
    else {
        const cs = c.children ? [c].concat(c.children()) : [c],
              last = cs.map(c => c[property]());
        cs.forEach(ch => ch[property](value));
        f(c);
        cs.forEach(ch => ch[property](last));
    }
    return c;
};

// turn off transitions for a chart or charts
const no_transitions = restore_getset('transitionDuration', 0);
// turn off transitions for a chart or charts and redraw
const redraw_chart_no_transitions = no_transitions(c => c.redraw());
// apply resizing to a chart or charts
// add a window.onresize handler to set the chart sizes based on the size of the parent div
// adjustX as an adjustment function

function apply_resizing(chart, adjustX, onresize) {
        if(!Array.isArray(chart))
            chart = [chart];
        if(!isNaN(adjustX))
            adjustX = (dx => x => x-dx)(adjustX);
        adjustX = adjustX || (x => x);
        chart.forEach(c => c.width(adjustX(rowDiv)));
        window.onresize = function () {
            if (onresize) {
                chart.forEach(onresize);
            }
            chart.forEach(c => {
                var rowDiv = $('#testingAvailability1-row').width();
                c.width(adjustX(rowDiv))
                    .xAxis().ticks(rowDiv/75)

                if (c.rescale) {
                    c.rescale();
                }
            });
            redraw_chart_no_transitions(chart);
        };
    };