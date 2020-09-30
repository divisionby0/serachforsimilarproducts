var j$ = jQuery.noConflict();
console.log("find similar j$=",j$);

j$ ( document ).ready(function() {
    new SimilarFinderApp(j$);
});
