const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

var csv = require("fast-csv");
var xs = [];
var ys = [];


// function range(start, end) {
//     var ans = [];
//     for (let i = start; i < end; i++) {
//         ans.push(i);
//     }
//     return ans;
// }

function readCSV() {
    dataArr = []
    return new Promise(function (resolve, reject) {
        csv
            .fromPath('THB.csv')
            .on("data", function (str) {
                // console.log(str);
                dataArr.push(str);
                // console.log(daraArr);
            })
            .on("end", function () {
                for (i of dataArr) {
                }
                // console.log(dataArr);
                console.log(dataArr.length);
                resolve(dataArr);
            });

    });
}


function findMax(data_set) {
    var max$ = data_set.then(innerData => {
        var MAX = 0;
        const len = innerData.length;
        // console.log('len', innerData[0][1])
        for (i = 0; i < len; i++) {
            if (MAX <= Number(innerData[i][1])) {
                MAX = Number(innerData[i][1]);
            }
        }
        // console.log('MAXXXXXXXX', MAX);
        return MAX
    })
    return max$
}


function findMin(data_set) {
    var min$ = data_set.then(innerData => {
        var MIN = 9999999999999999;
        const len = innerData.length;
        // console.log('len', innerData[0][1])
        for (i = 0; i < len; i++) {
            if (MIN >= Number(innerData[i][1])) {
                MIN = Number(innerData[i][1]);
            }
        }
        return MIN
    });

    return min$

};


async function prepareData() {
    var csv$ = readCSV();
    var maxFinder = findMax(csv$);
    var minFinder = findMin(csv$);

    let max = maxFinder.then(x => {
        Max = Math.abs(x);
        return Max
    });

    let min = minFinder.then(x => {
        Min = Math.abs(x);
        var maxReturn = max.then(y => {
            var divider;
            if (Min > y) {
                divider = Min
            }
            else {
                divider = y
            }
            console.log('divder: ', divider)

            let normData = csv$.then(Arr => {
               
                var input = [];
                var tempArr = [];
                var output = [];
                let i = 0; 
                var dataUsage = [input, output];
                Arr.map((Arrs) => {
                    
                    let j = tempArr.length;
                    numberArr = Number(Arrs[1])
                    divied = numberArr / divider
                    if (i % 6 != 0) {
                        tempArr.push(divied);
                        
                    }
                    else {
                        
                        if (i != 0){
                             let last = tempArr.slice(-1)[0]
                        
                            input.push(tempArr);
                            tempArr = [];
                            output.push(divied)
                        }
                    }
                    i++
                })
                // console.log(input);

                return dataUsage;
            })

            return normData

        })
            
        return maxReturn

    }).then(x => {
        return x

    }).then( x => {
        return x });
    

    return min
}

var model = tf.sequential();

// input of prediction
model.add(tf.layers.lstm({
    units: 200,
    inputShape: [5, 1],
    returnSequences: false
}));

// output of prediction
model.add(tf.layers.dense({
    units: 1, // จำนวน output 
    kernelInitializer: 'VarianceScaling',
    activation: 'relu'
}));

const LEARNING_RATE = 0.001;
const optimizer = tf.train.adam(LEARNING_RATE);

model.compile({
    optimizer: optimizer,
    loss: 'meanSquaredError',
    metrics: ['accuracy'],
});

async function main() {
    async function trainModel() {
        const history = await model.fit(
            trainXS,
            trainYS,
            {
                batchSize: 1, // element in array 
                epochs: 3, // number of round to train 
                shuffle: false,
                validationSplit: 0.2
            });
    }

    var ii = await prepareData();
    const llx = prepareTrainSet(ii[0], 80);
    const lly = prepareTrainSet(ii[1], 80);
    // testx = [[1,2,3,4,5],[4,2,1,3,4],[1,3,4,2,3]]
    // testy = [3,5,7]
    // console.log('llx',ii[0]);
    // console.log('lly', ii[1]);
    // xs = ii[0];
    // ys = ii[1];
    trainXS = tf.tensor2d(llx);
    trainXS = tf.reshape(trainXS, [-1, 5, 1])
    trainYS = tf.tensor1d(lly);
    trainYS = tf.reshape(trainYS, [-1, 1])

    await trainModel();
    const saveResult = await model.save('file://model3/');
    
    const load = async () => {
        model = await tf.loadModel('file://model3/model.json');
    };

    // const load2 = async () => {
    //     const model = await tf.loadModel('file://model3/model.json');
    // };

    await load();
    var lovex =  prepareTestSet(xs, 0);
    const az = [1,2,3,4,5] // 0.8924657534246576
    // console.log(lovex)
    let lx = lovex;
    let xxx = tf.tensor2d(lx);
    xxx = tf.reshape(xxx, [-1, 5, 1]);

    const r = await model.predict(xxx);
    let result = r.dataSync()[3];
    console.log(result);

    // await load2();
    // const lly = prepareTestSet(xs, 100)
    // let lx1 = lly;
    // let xxx1 = tf.tensor2d(lx1);
    // xxx1 = tf.reshape(xxx1, [1, 5, 1]);

    // const r1 = await model.predict(xxx1);
    // let result1 = r1.dataSync()[0];
    // console.log(result1);
}


function prepareTestSet(data, percent) {
    i = Math.floor(data.length * (percent / 100))
    console.log(i)
    return data.slice(-i)
}

function prepareTrainSet(data, percent) {
    i = Math.floor(data.length * (percent / 100))
    console.log(i)
    return data.slice(0, i)
}


// prepareData()
main();