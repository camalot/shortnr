const StatsMongoClient = require('../mongo/Stats');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function stats(req, res) {
  const Stats = new StatsMongoClient();
  try {
    const results = await Stats.getRedirectCounts();

    return res.status(200).json(results);
  } catch (err) {
    await logger.error(
      'StatsController.stats', 
      err.message, 
      { stack: err.stack, headers: req.headers, body: req.body, query: req.query, params: req.params },
    );
    return res.status(500).end();
  } finally {
    await Stats.close();
  }
}

async function statsById(req, res) {
  const Stats = new StatsMongoClient();
  try {

    const id = req.params.id;
    const results = await Stats.getRedirectCountsForShort(id);

    return res.status(200).json(results);
  } catch (err) {
    await logger.error(
      'StatsController.statsById', 
      err.message, 
      { stack: err.stack, headers: req.headers, body: req.body, query: req.query, params: req.params },
    );
    return res.status(500).end();
  } finally {
    await Stats.close();
  }
}

async function metrics(req, res) {
  const Stats = new StatsMongoClient();
  try {
    await Stats.connect();
    const redirects = await Stats.getRedirectCounts();
    const shortens = await Stats.getShortenCounts();
    const logs = await Stats.getLogCounts();
    const trackings = await Stats.getTrackingCounts();
    const tokens = await Stats.getTokenCounts();

    const metrics = redirects.map((redirect) => {
      return toPrometheusMetricValue('nus', 'redirect_click_thru', { id: redirect._id.id, creator: redirect._id.token_id }, redirect.total);
    });

    await shortens.forEach((shorten) => {
      metrics.push(toPrometheusMetricValue('nus', 'shorten', { creator: shorten._id.token_id }, shorten.total));
    });

    await logs.forEach(async (log) => {
      metrics.push(toPrometheusMetricValue('nus', 'logs', { level: log.level }, log.total));
    });

    await trackings.forEach(async (tracking) => {
      metrics.push(toPrometheusMetricValue('nus', 'action', { action: tracking._id }, tracking.total));
    });

    await tokens.forEach(async (token) => {
      metrics.push(toPrometheusMetricValue('nus', 'tokens', { enabled: token._id }, token.total));
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'close');
    
    res.send(metrics.join('\n'));
    
    return res.status(200).end();
  } catch (err) {
    await logger.error('StatsController.metrics', err.message, { stack: err.stack });
    return res.status(500).end();
  } finally {
    await Stats.close();
  }
}

function toPrometheusMetricValue(namespace, metric, labels, value) {
  const labelStr = Object.keys(labels).map((key) => {
    if (labels[key] === undefined) {
      return `${key}=""`;
    }
    return `${key}="${labels[key]}"`
  }).join(',');
  return `${namespace}_${metric}{${labelStr}} ${value}`;
}

module.exports = {
  stats, statsById, metrics,
};
