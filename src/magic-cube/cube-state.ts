
export class CubeState {
    public content: number[][][] = [];
    
    /**
     * Used for the visualization
     */
    public from?: [number, number, number];
    public to?: [number, number, number];

    /**
     * 
     * @param degree Degree of the cube
     * @returns 
     */
    public static createRandomCube(degree: number): CubeState {
        const numbers = [];
        for(let i = 1; i <= degree * degree * degree; i++) numbers.push(i);

        let state = new CubeState();
        for(let i = 0; i < degree; i++) {
            state.content.push([]);
            for(let j = 0; j < degree; j++) {
                state.content[i].push([]);
                for(let k = 0; k < degree; k++) {
                    state.content[i][j].push(CubeState.popRandomElement(numbers));
                }
            }
        }

        return state;
    }

    /**
     * 
     * @param degree Degree of the cube
     * @returns 
     */
    public static createOrderedCube(degree: number): CubeState {
        let state = new CubeState();
        let val = 1;

        for(let i = 0; i < degree; i++) {
            state.content.push([]);
            for(let j = 0; j < degree; j++) {
                state.content[i].push([]);
                for(let k = 0; k < degree; k++) {
                    state.content[i][j].push(val);
                    val++;
                }
            }
        }

        return state;
    }


    static magicNumberCache: {[key: number]: number} = {};
    /**
     * @param n Degree of the cube
     * @returns 
     */
    public static calculateMagicNumber(n: number): number {
        if(CubeState.magicNumberCache[n]) return CubeState.magicNumberCache[n];
        return n*n*n * (n*n*n + 1) / (2 * n*n);
    }
    public calculateMagicNumber(): number {
        return CubeState.calculateMagicNumber(this.content.length);
    }

    /**
     * @returns true if the cube is magic
     */
    public getCopy(): CubeState {
        let state = new CubeState();
        state.content = this.content.map(x => x.map(y => y.map(z => z)));
        state.from = this.from;
        state.to = this.to;
        return state;
    }

    /**
     * swap two random elements in a cube
     * @param i1 
     * @param j1 
     * @param k1 
     * @param i2 
     * @param j2 
     * @param k2 
     */
    public swap(i1: number, j1: number, k1: number, i2: number, j2: number, k2: number): void {
        let temp = this.content[i1][j1][k1];
        this.content[i1][j1][k1] = this.content[i2][j2][k2];
        this.content[i2][j2][k2] = temp;

        this.from = [i1, j1, k1];
        this.to = [i2, j2, k2];
    }

    public swapRandom(): void {
        let n = this.content.length;
        let i1 = Math.floor(Math.random() * n);
        let j1 = Math.floor(Math.random() * n);
        let k1 = Math.floor(Math.random() * n);
        let i2 = Math.floor(Math.random() * n);
        let j2 = Math.floor(Math.random() * n);
        let k2 = Math.floor(Math.random() * n);
        this.swap(i1, j1, k1, i2, j2, k2);

        this.from = [i1, j1, k1];
        this.to = [i2, j2, k2];
    }

    cachedMaxAmountOfMagic: number = -1;
    /**
     * @returns maximum possible amount of magic rows/columns/pillars/diagonals/triagonals in a magic cube
     */
    public get maxAmountOfMagic(): number {
        if(this.cachedMaxAmountOfMagic !== -1) return this.cachedMaxAmountOfMagic
        const row = this.content.length * this.content.length;
        const column = this.content.length * this.content.length;
        const pillar = this.content.length * this.content.length;
        const diagonal = this.content.length * 6;
        const triagonal = 4;
        return row + column + pillar + diagonal + triagonal;
    }
    
    /**
     * @returns a random successor of the cube
     */
    public getRandomSuccessor(): CubeState {
        let neighbor = this.getCopy();
        neighbor.swapRandom();
        return neighbor;
    }
    
    /**
     * Utility function to pop a random element from an array. May be better to create utility class for this in separate file. But the dependency is annoying.
     * @param array 
     * @returns 
     */
    static popRandomElement<T>(array: T[]): T {
        let index = Math.floor(Math.random() * array.length);
        return array.splice(index, 1)[0];
    }

    public iterateAndDo(onIterated: (list: number[]) => void): void {
        const n = this.content.length;

        let rowCount = 0;
        let columnCount = 0;
        let pillarCount = 0;
        let diagonalCount = 0;
        let triagonalCount = 0;

        // rows
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                rowCount++;
                let arr = [];
                for(let k = 0; k < n; k++) {
                    arr.push(this.content[i][j][k]);
                    // console.log(i, j, k, '|', this.content[i][j][k]);
                }
                onIterated(arr);
            }
        }

        // columns
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                columnCount++;
                let arr = [];
                for(let k = 0; k < n; k++) {
                    arr.push(this.content[i][k][j]);
                    // console.log(i, j, k, '|', this.content[i][k][j]);
                }
                onIterated(arr);
            }
        }

        // pillars
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                pillarCount++;
                let arr = [];
                for(let k = 0; k < n; k++) {
                    arr.push(this.content[k][i][j]);
                    // console.log(i, j, k, '|', this.content[k][i][j]);
                }
                onIterated(arr);
            }
        }

        // diagonals
        for(let i = 0; i < n; i++) {
            diagonalCount++;
            let arr = [];
            for(let j = 0; j < n; j++) {
                arr.push(this.content[i][j][j]);
                // console.log(i, j, j, '|', this.content[i][j][j]);
            }
            onIterated(arr);

            diagonalCount++;
            arr = [];
            for(let j = 0; j < n; j++) {
                arr.push(this.content[i][n-j-1][j]);
                // console.log(i, n-j-1, j, '|', cube[i][n-j-1][j])
            }
            onIterated(arr);
        }

        for(let i = 0; i < n; i++) {
            diagonalCount++;
            let arr = [];
            for(let j = 0; j < n; j++) {
                arr.push(this.content[j][i][j]);
                // console.log(j, i, j, '|', this.content[j][i][j]);
            }
            onIterated(arr);

            diagonalCount++;
            arr = [];
            for(let j = 0; j < n; j++) {
                arr.push(this.content[n-j-1][i][j]);
                // console.log(n-j-1, i, j, '|', this.content[n-j-1][i][j]);
            }
            onIterated(arr);
        }

        for(let i = 0; i < n; i++) {
            diagonalCount++;
            let arr = [];
            for(let j = 0; j < n; j++) {
                arr.push(this.content[j][j][i]);
                // console.log(j, j, i, '|', this.content[j][j][i]);
            }
            onIterated(arr);

            diagonalCount++;
            arr = [];
            for(let j = 0; j < n; j++) {
                arr.push(this.content[n-j-1][j][i]);
                // console.log(n-j-1, j, i, '|', this.content[n-j-1][j][i]);
            }
            onIterated(arr);
        }


        // triagonals
        triagonalCount++;
        let arr = [];
        for(let i = 0; i < n; i++) {
            arr.push(this.content[i][i][i]);
            // console.log(i, i, i, '|', this.content[i][i][i]);
        }
        onIterated(arr);

        triagonalCount++;
        arr = [];
        for(let i = 0; i < n; i++) {
            arr.push(this.content[n-i-1][i][i]);
            // console.log(n-i-1, i, i, '|', this.content[n-i-1][i][i]);
        }
        onIterated(arr);

        triagonalCount++;
        arr = [];
        for(let i = 0; i < n; i++) {
            arr.push(this.content[i][n-i-1][i]);
            // console.log(i, n-i-1, i, '|', this.content[i][n-i-1][i]);
        }
        onIterated(arr);

        triagonalCount++;
        arr = [];
        for(let i = 0; i < n; i++) {
            arr.push(this.content[i][i][n-i-1]);
            // console.log(i, i, n-i-1, '|', this.content[i][i][n-i-1]);
        }
        onIterated(arr);

        // console.log("Counts:");
        // console.log(rowCount, columnCount, pillarCount, diagonalCount, triagonalCount);
    }


    /**
     * @returns true if the cube is magic. Not using the iterator becase we may return early.
     */
    public isMagicCube(): boolean {
        const n = this.content.length;
        const magicNumber = CubeState.calculateMagicNumber(n);

        let rowCount = 0;
        let columnCount = 0;
        let pillarCount = 0;
        let diagonalCount = 0;
        let triagonalCount = 0;

        // rows
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                rowCount++;
                let total = 0;
                for(let k = 0; k < n; k++) {
                    total += this.content[i][j][k];
                    // console.log(i, j, k, '|', this.content[i][j][k]);
                }
                if(total !== magicNumber) return false;
            }
        }

        // columns
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                columnCount++;
                let total = 0;
                for(let k = 0; k < n; k++) {
                    total += this.content[i][k][j];
                    // console.log(i, k, j, '|', this.content[i][k][j]);
                }
                if(total !== magicNumber) return false;
            }
        }

        // pillars
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                pillarCount++;
                let total = 0;
                for(let k = 0; k < n; k++) {
                    total += this.content[k][i][j];
                }
                if(total !== magicNumber) return false;
            }
        }

        // diagonals
        for(let i = 0; i < n; i++) {
            let total = 0;
            diagonalCount++;
            for(let j = 0; j < n; j++) {
                total += this.content[i][j][j];
                // console.log(i, j, j, '|', this.content[i][j][j]);
            }
            if(total !== magicNumber) return false;

            total = 0;
            diagonalCount++;
            for(let j = 0; j < n; j++) {
                total += this.content[i][n-j-1][j];
                // console.log(i, n-j-1, j, '|', this.content[i][n-j-1][j]);
            }
            if(total !== magicNumber) return false;
        }

        for(let i = 0; i < n; i++) {
            let total = 0;
            diagonalCount++;
            for(let j = 0; j < n; j++) {
                total += this.content[j][i][j];
                // console.log(j, i, j, '|', this.content[j][i][j]);
            }
            if(total !== magicNumber) return false;

            total = 0;
            diagonalCount++;
            for(let j = 0; j < n; j++) {
                total += this.content[n-j-1][i][j];
                // console.log(n-j-1, i, j, '|', this.content[n-j-1][i][j]);
            }
            if(total !== magicNumber) return false;
        }

        for(let i = 0; i < n; i++) {
            let total = 0;
            diagonalCount++;
            for(let j = 0; j < n; j++) {
                total += this.content[j][j][i];
                // console.log(j, j, i, '|', this.content[j][j][i]);
            }
            if(total !== magicNumber) return false;

            total = 0;
            diagonalCount++;
            for(let j = 0; j < n; j++) {
                total += this.content[n-j-1][j][i];
                // console.log(n-j-1, j, i, '|', this.content[n-j-1][j][i]);
            }
            if(total !== magicNumber) return false;
        }

        // triagonals
        let total = 0;
        triagonalCount++;
        for(let i = 0; i < n; i++) {
            total += this.content[i][i][i];
            // console.log(i, i, i, '|', this.content[i][i][i]);
        }
        if(total !== magicNumber) return false;

        total = 0;
        triagonalCount++;
        for(let i = 0; i < n; i++) {
            total += this.content[n-i-1][i][i];
            // console.log(n-i-1, i, i, '|', this.content[n-i-1][i][i]);
        }
        if(total !== magicNumber) return false;

        total = 0;
        triagonalCount++;
        for(let i = 0; i < n; i++) {
            total += this.content[i][n-i-1][i];
            // console.log(i, n-i-1, i, '|', this.content[i][n-i-1][i]);
        }
        if(total !== magicNumber) return false;

        total = 0;
        triagonalCount++;
        for(let i = 0; i < n; i++) {
            total += this.content[i][i][n-i-1];
            // console.log(i, i, n-i-1, '|', this.content[i][i][n-i-1]);
        }
        if(total !== magicNumber) return false;

        return true;
    }

    




    static pairsCache: {[key: number]: [number[], number[]][]} = {};
    static getCubeSwapPairs(n: number): [number[], number[]][] {
        if(CubeState.pairsCache[n]) return CubeState.pairsCache[n];
        
        const arr = [];
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                for(let k = 0; k < n; k++) {
                    arr.push([i, j, k]);
                }
            }
        }
        const pairs: [number[], number[]][] = [];
        for(let i = 0; i < arr.length - 1; i++) {
            for(let j = i+1; j < arr.length; j++) {
                pairs.push([arr[i], arr[j]]);
            }
        }

        CubeState.pairsCache[n] = pairs;
        return pairs;
    }

}