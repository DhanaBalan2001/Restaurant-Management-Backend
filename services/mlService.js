import tf from '@tensorflow/tfjs';

export class DishRecommendationSystem {
  constructor() {
    this.model = null;
    this.features = ['timeOfDay', 'dayOfWeek', 'season', 'orderFrequency'];
  }

  async trainModel(historicalOrders) {
    const processedData = this.preprocessData(historicalOrders);
    
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 64, activation: 'relu', inputShape: [4] }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'softmax' })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    await this.model.fit(processedData.inputs, processedData.labels, {
      epochs: 50,
      batchSize: 32
    });
  }

  async predictPopularDishes(currentContext) {
    const prediction = this.model.predict(
      tf.tensor2d([this.extractFeatures(currentContext)])
    );
    return prediction.arraySync();
  }
}