const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');


var csv = require("fast-csv");
var xs = [];
var ys = [];
var slice_num = 6;


function readCSV() {
    dataArr = []
    return new Promise(function (resolve, reject) {
        csv
            .fromPath('THB.csv')
            .on("data", function (str) {
                dataArr.push(str);
            })
            .on("end", function () {
                for (i of dataArr) {
                }
                resolve(dataArr);
            });

    });
}


async function findMax(dataSet) {
    var MAX = 0;
    for (i = 0; i < dataSet.length; i++) {
        if (MAX <= Number(dataSet[i][1])) MAX = Number(dataSet[i][1]);     
    }
    return MAX
}

async function readData(){
    var csv$ = readCSV();
    var data = csv$.then(Arr => {
        return Arr
    })
    return data
}  

async function reshape(data) {
    var sliced_arr = []
    for(var i=0; i < data.length - 1; i++){
        if (i + slice_num <= data.length){
            sliced_arr.push(tmp_arr = data.slice(i, slice_num + i));  // Slice for first n - 1 element set            
        } else if (i + slice_num == data.length) {
            sliced_arr.push(data.slice(i))
        } else {
            break;
        }
    }
    return sliced_arr
}

async function prepareData(reshapedData) {   
    freedom_set = []
    follow_set = []
    for(var i=0; i < reshapedData.length - 1; i++) {
        nthRow = reshapedData[i]
        freedom_set.push(nthRow.slice(0, slice_num - 1))
        follow_set.push(nthRow[slice_num - 1])
    }
    return [freedom_set, follow_set]
}



async function normaliseData(data, divider){
    normaliseArr = []
    for(var i=0; i< data.length; i++){
        normaliseArr.push(data[i][1] / divider)
    }
    return normaliseArr
}
 

var model = tf.sequential();

// input of prediction
model.add(tf.layers.lstm({
    units: 200,
    inputShape: [slice_num - 1, 1],
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

async function prepareTestSet(data, percent) {
    i = Math.floor(data.length * (percent / 100))
    // console.log(i)
    return data.slice(-i)
}

async function prepareTrainSet(data, percent) {
    i = Math.floor(data.length * (percent / 100))
    // console.log(i)
    return data.slice(0, i)
}

async function main() {
    async function trainModel() {
        const history = await model.fit(
            trainXS,
            trainYS,
            {
                batchSize: 1, // element in array 
                epochs: 10, // number of round to train 
                shuffle: false,
                validationSplit: 0.2
            });
    }
    var rawData = await readData();
    var max = await findMax(rawData);
    // console.log(max)
    var normalisedData = await normaliseData(rawData, max);
    var reshapedData= await reshape(normalisedData);
    // console.log(reshapedData)
    var preparedData = await prepareData(reshapedData);
    console.log(preparedData[0].length)
    console.log(preparedData[1].length)

  
    var trainXArr = await prepareTrainSet(preparedData[0], 80);
    var trainYArr = await prepareTrainSet(preparedData[1], 80);
    // console.log(trainYArr.length)
    // console.log(trainXArr)
    // console.log(trainYArr);

    trainXS = tf.tensor2d(trainXArr);
    trainXS = tf.reshape(trainXS, [-1, slice_num - 1, 1])
    trainYS = tf.tensor1d(trainYArr);
    trainYS = tf.reshape(trainYS, [-1, 1])

    await trainModel();
    const saveResult = await model.save('file://model/');

    var load = async () => {
         model = await tf.loadModel('file://model/model.json');
    };

    await load();
    let testArr = await prepareTestSet(preparedData[0], 20);
    // console.log(testArr)
    let testSet = tf.tensor2d(testArr);
    testSet = tf.reshape(testSet, [-1, slice_num - 1, 1]);

    let r = await model.predict(testSet);
    var result = r.dataSync()[0];
    console.log(result * max);
}

// prepareData()
main();