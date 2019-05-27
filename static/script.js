const STAVEWIDTH = 100;
const STAVELINEWIDTH = 13;
const MARGIN = 30;
const SELECTED_COLOUR = [0,0,200];
const CLICK_MARGIN = 5;

var notes = [];
var trebleClef,note_tail, blue_note_tail,stave,demo_note,cnv;

var mode = "create";
var note_mode="crotchet";
var note_colour=0;
var mouse_original_x_y;
var mouse_dragged_displacement;

class Stave {
    constructor(num_staves=1) {
        this.num_staves = num_staves;
    }

    draw() {
        stroke(0);
        strokeWeight(2);
        for (var stavenum=1;stavenum<=this.num_staves;stavenum++) {
            image(trebleClef,MARGIN-5,stavenum*STAVEWIDTH,50,64);
            for (var linenum=0;linenum<5;linenum++) {
                var y = linenum*STAVELINEWIDTH+stavenum*STAVEWIDTH;
                line(MARGIN,y,width-MARGIN,y);
            }
        }
    }

    getNoteFromLine(line, inbetween=false) {
        var notes = ["g","a","b","c","d","e","f","G","A"]
		var thenote = (-2*line)+6;
        if (inbetween) {
            thenote+=1;
        }

        return notes[thenote];
    }

    snapToLine(y) {
        for (var stavenum=1;stavenum<=this.num_staves;stavenum++) {
            for (var linenum=0;linenum<4;linenum++) {
                var stave_y = linenum*STAVELINEWIDTH+stavenum*STAVEWIDTH;
                if (y<=stave_y && y>0) {
					if ((linenum==0)&&(stavenum!=1)) {
						if (y<(stave_y-(STAVEWIDTH/3))) {
							return [3*STAVELINEWIDTH+(stavenum-1)*STAVEWIDTH, "g"];
						} else {
							return [stave_y-STAVELINEWIDTH, "A"];
						}
					}
                    if (y<=stave_y-STAVELINEWIDTH) {
                        return [stave_y-STAVELINEWIDTH,"A"]
                    } else if (y<=stave_y-STAVELINEWIDTH/2) {
                        return [stave_y-STAVELINEWIDTH/2,this.getNoteFromLine(linenum, true)]
                    } else {
                        return [stave_y,this.getNoteFromLine(linenum)]
                    }
                } else if (y<=0) {
                    return null
                }
            }
        }
        return [stave_y, "g"];
    }
}

class DemoNote {
    constructor() {
	this.x = mouseX;
	this.y = mouseY;
	this.col = [50,50,200,150];
	this.width = 15;
	this.height = 10;
	this.note = "g";
    }

    draw() {
		fill(this.col);
		stroke(this.col);
		strokeWeight(2);
		ellipse(this.x,this.y,this.width,this.height);
		if (this.note=="A") {
			line(this.x-11,this.y,this.x+11,this.y);
		}
    }

    update(stave) {
		this.x = mouseX;
		var staveline = stave.snapToLine(mouseY);
		if (staveline!=null) {
			this.y = staveline[0];
			this.note = staveline[1];
		}
    }
}
	

class Note {
    constructor(stave, x,actual_y,type,col) {
        this.x = x;
        this.y = stave.snapToLine(actual_y)[0];
		this.actual_y = this.y;	// this is the actual y value, y is just the value snapped to the line - starts off the same so dragging is fine
        this.type = type;
        this.name = stave.snapToLine(actual_y)[1];
        this.col = col;
        this.width = 15;
        this.height = 10;
		this.stem_height = 50;
		this.selected = false;
		this.connected = [];
    }

    draw() {
		var snapped = stave.snapToLine(this.actual_y);
		if (snapped != null) {
			this.y = snapped[0];	// snaps note to line
			this.name = snapped[1];
		}

        fill(this.col);
        if (this.selected) {
			stroke(SELECTED_COLOUR);
		} else {
			if ((this.type=="semibreve")||(this.type=="minim")) {
				stroke(0);
			} else {
				stroke(this.col);
			}
		}
        if (this.name=="A") {
			strokeWeight(2);
            line(this.x-11,this.y,this.x+11,this.y);
        }
		strokeWeight((this.type=="semibreve" || this.type=="minim") ? 2 : 0)
			/*
        switch (this.type) {
            case "semibreve": 
			case "minim":
				strokeWeight(2); break;
            default: strokeWeight(0);
        }
		*/
		if (this.selected) {
			switch (this.type) {
			case "semibreve":
			case "minim":
				fill(this.col); break;
			default: fill(SELECTED_COLOUR);
			}
		}
        ellipse(this.x,this.y,this.width,this.height);

        switch (this.type) {
            case "semibreve": strokeWeight(0); stroke(0); break;
            case "minim": stroke(0); break;
            default: strokeWeight(2); stroke(this.col);
        }
		if (this.selected) {
			stroke(SELECTED_COLOUR);
		}

        line(this.x-(this.width/2),this.y,this.x-(this.width/2),this.y+this.stem_height);

		var tail;
		switch (this.type) {
			case "semibreve":
			case "minim":
			case "crotchet":
				tail=0; break;
			case "quaver": tail=1; break;
			case "semiquaver": tail=2; break;
			case "demisemiquaver": tail=3; break;
			default: console.log("Error!");
		}
		
		var y = 0;
		var tail_image;
		switch (this.selected) {
			case true: tail_image=blue_note_tail; break;
			default: tail_image=note_tail;
		}
		if (this.connected.length == 0) {
			for (var tailnum=0;tailnum<tail;tailnum++) {
				image(tail_image,this.x-this.width/2-2,this.y+this.stem_height-20-10*y,10,25);
				y++;
			}
		} else {
			strokeWeight(2);
			for (var tailnum=0;tailnum<tail;tailnum++) {
				for (var note of notes) {
					line(this.x-this.width/2,this.y+this.stem_height-10*y,note.x-note.width/2,note.y+note.stem_height-10*y);
					y++;
				}
			}
		}
    }
    update(x=null,y=null,name=null) {
        if (x!=null) {
            this.x = x;
        }
        if (y!=null) {
            this.y = y;
        }
        if (name!=null) {
            this.name = name;
        }
    }
   checkIfSelected(x,y) {
       var top = this.y-this.height/2-CLICK_MARGIN;
       var bottom = this.y+this.height/2+CLICK_MARGIN;
       var left = this.x-this.width/2-CLICK_MARGIN;
       var right = this.x+this.width/2+CLICK_MARGIN;
       return ((x>left)&&(x<right)&&(y>top)&&(y<height));
   }
}


function setup() {
    cnv = createCanvas(210*5,297*5);
    cnv.parent('page')
    trebleClef = loadImage('/static/images/trebleClef.png');     // 375 x 640
    note_tail = loadImage('/static/images/noteTail.png');          // 72 x 155
	blue_note_tail = loadImage('/static/images/blueNoteTail.png');
    stave = new Stave(2);
    demo_note = new DemoNote();
    pdf = createPDF();
    pdf.beginRecord();
}

function draw() {
    background(255);
    update_note_mode();
    stave.draw();
    update_demo_note();
    drawNotes();
}

function update_note_mode() {
    note_mode = $('input[name=note]:checked', '#note_mode').val();
    switch (note_mode) {
        case 'semibreve':note_colour=[0,0,0,0]; break;
        case 'minim':note_colour=[0,0,0,0]; break;
        default: note_colour=0;
    }
	mode = $("#mode").val();
	if (mode!="select") {
		deselectAllNotes();
	}
}

function update_demo_note() {
	if (mode=="create") {
		demo_note.update(stave);
		demo_note.draw();
	}
}


function drawNotes() {
    for (note of notes) {
        note.draw(stave);
    }
}

function getSelectedNote() {
    var selected;
    for (note of notes) {
		if (note.checkIfSelected(mouseX,mouseY)) {
			selected = note;
		}
    }
    return selected;
}

function deselectAllNotes() {
	for (note of notes) {
		note.selected=false;
	}
}

function mousePressed() {
    if (mouseButton==LEFT) {
		if (mode=="create") {
			selected_note = getSelectedNote();
			if (selected_note==null) {
				var x = mouseX;
				if (x>0 && x<width) {
					var snapped = stave.snapToLine(mouseY);
					if (snapped!=null) {
						var y = snapped[0];
						var note = snapped[1];
					
						var note = new Note(stave, mouseX,mouseY,note_mode,note_colour);
						notes.push(note);
					}
				}
			}
		} else if (mode=="select") {
			mouse_original_x_y = [mouseX,mouseY];
			mouse_dragged_displacement = [0,0];
			var selected_note = getSelectedNote();
			if (selected_note != null) {
				selected_note.selected=!(selected_note.selected);
			} else {
				deselectAllNotes();
			}
		}
    } else if (mouseButton==MIDDLE) {
        pdf.save();
    }
}

function mouseReleased() {
	for (note of notes) {
		note.actual_y = note.y;	// so that when dragging again, note starts at right place
	}
}

function selectedNotes() {
	var selected = [];
	for (note of notes) {
		if (note.selected) {
			selected.push(note);
		}
	}
	return selected;
}

function keyPressed() {
	if (keyCode == ESCAPE) {
		if (mode=="create") {
			$("#mode").val("select");
		} else if (mode=="select") {
			$("#mode").val("create");
		}
	} else if (keyCode == 71) {	// g
		if (mode=="select") {
			for (eachnote of selectedNotes()) {
				for (othernote of selectedNotes()) {
					if (eachnote!=othernote) {
						eachnote.connected.push(othernote);
					}
				}
			}
		}
	}
}

function mouseDragged() {
	if (mode=="select") {
		if (mouseButton==LEFT) {
			mouse_dragged_displacement[0]+=mouseX-mouse_original_x_y[0];
			mouse_dragged_displacement[1]+=mouseY-mouse_original_x_y[1];
			for (note of notes) {
				if (note.selected) {
					note.x += mouse_dragged_displacement[0];
					note.actual_y += mouse_dragged_displacement[1];
				}
			}
			mouse_original_x_y = [mouseX,mouseY];
			mouse_dragged_displacement = [0,0];
		}
	}
}
