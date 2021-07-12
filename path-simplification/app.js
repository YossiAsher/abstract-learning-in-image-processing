const paper = require('paper')
var path = require('path');
var fs = require('fs');
var glob = require( 'glob' );  

input_path = '../svg/'
output_path = '../svg_100/'
simplify_factor = 100
max_path_size = 143

glob( input_path + '**/*.svg', function( err, files ) {
   files.forEach(file => {
    myFunc(file, output_path)
   })
});

function myFunc(file, output_path) {
    console.log('Read!', file);
    var new_path = file.replace(input_path, output_path)
    var dir_name = path.dirname(new_path)
    fs.mkdir(dir_name, { recursive: true }, (err) => {
        if (err) throw err;
      });
    with (paper) {
        paper.setup(new paper.Size(300, 600));
        paper.project.importSVG(file, {
            onLoad: function(item) {
                var newProject = new Project();
                var in_total_len = 0
                var out_total_len = 0
                item.children.forEach(
                    element => {
                        if(typeof element.segments !== 'undefined') {
                            in_total_len += element.segments.length
                            element.simplify(simplify_factor)
                            out_total_len += element.segments.length
                            var copy = element.copyTo(newProject);
                        }
                    });
                if(out_total_len < max_path_size){
                    var svg = newProject.exportSVG({ asString: true});
                    fs.writeFile(path.resolve(new_path), svg, function (err) {
                        if (err) throw err;
                        console.log('Saved!', new_path);
                    });
                } else {
                    console.log("in_total_len", in_total_len)
                    console.log("out_total_len", out_total_len)
                }
            },
            onError: function(message) {
                console.error(message);
            }
        });
    }
}
