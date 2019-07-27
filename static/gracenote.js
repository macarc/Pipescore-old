class Gracenote {
	constructor(x,y,name) {
		this.stem_height = 20;
		this.x = x;
		this.y = y;
		this.name = name;
		this.selected = false;
	}
	draw(snapToLine) {
		strokeWeight(0);
		const stem_y = this.y - this.stem_height;
		this.selected ? fill(SELECTED_COLOUR) : fill(BLACK);
		this.y = (snapToLine(this.actual_y) != null) ? snapToLine(this.actual_y)[0] : this.y;
		this.name = (snapToLine(this.actual_y) != null) ? snapToLine(this.actual_y)[1] : this.name;
		
		stroke(WHITE);
		ellipse(this.x,this.y,7,5);
		stroke(BLACK);
		strokeWeight(1.5);
		line(this.x+3.5,this.y,this.x+3.5,stem_y);
		if (this.name === 'A') {
			line(this.x-4.5,this.y,this.x+4.5,this.y);
		}
		line(this.x+3.5,stem_y,this.x+7,stem_y+5);
		line(this.x+3.5,stem_y+4,this.x+7,stem_y+9);
		line(this.x+3.5,stem_y+8,this.x+7,stem_y+13);
	}
	checkIfSelected() {
		if (((this.x-CLICK_MARGIN) < mouseX) && ((this.x+CLICK_MARGIN) > mouseX) && ((this.y-CLICK_MARGIN) < mouseY) && ((this.y+CLICK_MARGIN)>mouseY)) {
			this.selected = true;
			return true;
		}
		return false;
	}
	dragSelected(dx,dy) {
		this.x += dx;
		this.y += dy;
	}
	deselect() {
		this.selected = false;
	}
}