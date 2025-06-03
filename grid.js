// for handling collision
class Grid {
    constructor(cellsize, screenWidth, screenHeight, numElements) {
        this.cellsize = cellsize;
        this.columns = Math.ceil(screenWidth / cellsize);
        this.rows = Math.ceil(screenHeight / cellsize);
  
        // the sparse solution
        this.cellsArray = [];
        for (let i = 0; i < this.columns * this.rows; i++) {
            this.cellsArray.push([]);
        }
  
  
        // the dense solution
        // this.cellStart = new Array(this.columns * this.rows + 1).fill(0);
        // this.cellEntries = new Array(numElements).fill(null);
    }

    #getCellIndices(element) {
        const {x:vx, y:vy} = element.getVelocity();
        const xi = Math.floor((element.x + vx)/ this.cellsize);
        const yi = Math.floor((element.y + vy)/ this.cellsize);
        return {xi, yi};
    }
    #getArrayIndex(xi, yi) {
        return yi * this.columns + xi;
    }
  
    add(element) {
        const {xi, yi} = this.#getCellIndices(element)

        const arrayIndex = this.#getArrayIndex(xi, yi);
        console.log(
            `xi: ${xi} yi:${yi} Arrayindex: ${arrayIndex}, cellsArray size: ${this.cellsArray.length}`
        );
        this.cellsArray[arrayIndex].push(element);
        element.gridIndex = arrayIndex;
    }
  
    remove(element) {
        const arrayIndex = element.gridIndex;
        let cell = this.cellsArray[arrayIndex];
        // cell is an array
        const elementIndex = cell.indexOf(element);
        if (elementIndex == -1){
            console.log(`element not found in cell index ${arrayIndex}`);
            return;
        } else {
            cell.splice(elementIndex, 1);
        }
    }

    query(element){
        let q = [];
        const {xi, yi} = this.#getCellIndices(element);
        const xstart = max(0, xi - 1);
        const xend = min(this.columns - 1, xi + 1);
        const ystart = max(0, yi - 1);
        const yend = min(this.rows - 1, yi + 1);

        for (let x = xstart; x <= xend; x++){
            for (let y = ystart; y <= yend; y++) {
                let idx = this.#getArrayIndex(x, y);
                console.log(
                    `xi: ${x} yi:${y} Arrayindex: ${idx}`
                );
                let neighbours = this.cellsArray[idx];
                if (neighbours.length == 0) continue;
                q.push(...neighbours);
            }
        }
        return q;
    }
}