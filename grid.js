// for handling collision
class Grid {
    constructor(cellsize, screenWidth, screenHeight, numElements) {
        this.cellsize = cellsize;
        this.columns = Math.ceil(screenWidth / cellsize);
        this.rows = Math.ceil(screenHeight / cellsize);
  
        // the sparse solution
        this.cells = [];
        for (let i = 0; i < this.columns * this.rows; i++) {
            this.cells.push([]);
        }
  
  
        // the dense solution
        // this.cellStart = new Array(this.columns * this.rows + 1).fill(0);
        // this.cellEntries = new Array(numElements).fill(null);
    }
  
    add(element) {
        const xi = Math.floor(element.x / this.cellsize);
        const yi = Math.floor(element.y / this.cellsize);
  
        const arrayIndex = yi * this.columns + xi;
        this.cells[arrayIndex].push(element);
        element.gridIndex = arrayIndex;
    }
  
    remove(element) {
        const arrayIndex = element.gridIndex;
        let cell = this.cells[arrayIndex];
        // cell is an array
        const elementIndex = cell.indexOf(element);
        if (elementIndex == -1){
            console.log(`element not found in cell index ${arrayIndex}`);
            return;
        } else {
            cell.splice(elementIndex, 1);
        }
    }
  }