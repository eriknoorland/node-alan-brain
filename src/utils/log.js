const colors = {
  reset: { cmd: '\x1b[0m%s\x1b[0m', html: '#fff' },
  green: { cmd: '\x1b[32m%s\x1b[0m', html: '#0f0' },
  red: { cmd: '\x1b[31m%s\x1b[0m', html: '#f00' },
  yellow: { cmd: '\x1b[33m%s\x1b[0m', html: '#ff0' },
  blue: { cmd: '\x1b[34m%s\x1b[0m', html: '#00f' },
  magenta: { cmd: '\x1b[35m%s\x1b[0m', html: '#f0f' },
  cyan: { cmd: '\x1b[36m%s\x1b[0m', html: '#0ff' },
  white: { cmd: '\x1b[37m%s\x1b[0m', html: '#fff' },
};

const logs = [];

/**
 * Log
 * @param {String} body
 * @param {String} resource
 * @param {String} color
 */
module.exports = (io) => {
  return (body, resource = 'app', color = 'reset') => {
    const message = `[${resource}] ${body}`;
    
    logs.push(`<span style="color: ${colors[color].html};">${message}</span>`);
    io.emit('log', logs.join(','));

    console.log(colors[color].cmd, message);
  };
};
