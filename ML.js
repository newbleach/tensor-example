const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

var csv = require("fast-csv");
var xs = [];
var ys = [];


function range(start, end) {
    var ans = [];
    for (let i = start; i < end; i++) {
        ans.push(i);
    }
    return ans;
}

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
                    // console.log(i[1]);
                    let x = i[1];
                    let y = Number(x);
                    // console.log(typeof(y));
                    // console.log(dataArr);
                }
                // console.log(dataArr);
                console.log(dataArr.length);
                resolve(dataArr);
            });

    });
}


function findMax(data_set) {
    var xz = data_set.then(innerData => {
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
    return xz
}


function findMin(data_set) {
    var xz = data_set.then(innerData => {
        var MIN = 9999999999999999;
        const len = innerData.length;
        // console.log('len', innerData[0][1])
        for (i = 0; i < len; i++) {
            if (MIN >= Number(innerData[i][1])) {
                MIN = Number(innerData[i][1]);
            }
        }
        // console.log('MAXXXXXXXX', MAX);
        return MIN
    })
    return xz

}


async function prepareData() {
    var xsd = readCSV()
    var zx = findMax(xsd);
    var ss = findMin(xsd);
    var oor;

    let max = zx.then(x => {
        Max = Math.abs(x);
        console.log('maxxxxxx', Max)
        return Max
    });
    max.then(z => console.log('zzzzzzz:', z));

    // console.log(max)
    let min = ss.then(x => {
        Min = Math.abs(x);
        var mm =max.then(y => {
            var divider
            divider: Float64Array
            if (Min > y) divider = Min
            else divider = y

            console.log('divder: ', divider)

            let normData = xsd.then(Arr => {
                let i = 0;
                let j = 0;
                var input = [];
                var tempArr = [];
                var output = [];
                var datauseage = [input, output];
                Arr.map((Arrs) => {
                    numberArr = Number(Arrs[1])
                    // console.log('asdasdasdasd',numberArr / divider);
                    dived = numberArr / divider
                    if (i % 269 != 0) {
                        tempArr.push(dived);
                    }
                    else {
                        if (i != 0){
                            input.push(tempArr);
                            tempArr = [];
                            output.push(dived)
                        }
                    }
                    i++
                })
                // console.log(input);
                // console.log(output);

                return datauseage;
            })
            // normData.then(x => { console.log ( x)});
            return normData

        })
            
        return mm

    }).then(x => {
        return x

    }).then( x => {
        return x });
    

    return min


    // let arr = range(TIME_STEP, dataset.length - NUM_OUT + 1);

    // arr.forEach(function(i) {

    // });

    //    xs = [[10,20,30],[20,30,40],[30,40,50]];
    //    ys = [40,50,60];

}

const model = tf.sequential();

// input of prediction
model.add(tf.layers.lstm({
    units: 200,
    inputShape: [268, 1],
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
                epochs: 20, // number of round to train 
                shuffle: false,
                validationSplit: 0.2
            });
    }

    var ii = await prepareData();
    const llx = prepareTrainSet(ii[0], 80);
    const lly = prepareTrainSet(ii[1], 80);
    xs = llx;
    ys = lly;
    trainXS = tf.tensor2d(xs);
    trainXS = tf.reshape(trainXS, [-1, 268, 1])
    trainYS = tf.tensor1d(ys);
    trainYS = tf.reshape(trainYS, [-1, 1])

    await trainModel();
    const saveResult = await model.save('file://model2/');

    const load = async () => {
        var model2 = await tf.loadModel('file://model2/model.json');
    };

    // const load2 = async () => {
    //     const model2 = await tf.loadModel('file://model2/model.json');
    // };
    
    await load();
    let lovex = prepareTestSet(xs, 20);
    let lx = lovex;
    let xxx = tf.tensor2d(lx);
    xxx = tf.reshape(xxx, [1, 268, 1]);

    const r = await model2.predict(xxx);
    let result = r.dataSync()[0];
    console.log(result);
    console.log(findMax());

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