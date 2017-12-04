var fs = require('fs');
var path = require('path');

module.exports = {
	getCurrentPath: () => {
		return process.cwd();
	},

	getRealPath: () => {
		return path.dirname(fs.realpathSync(__filename));
	},

	getPathBase: (filePath) => {
		return path.basename(filePath);
	},

	getRelativePath : function(from, to) {
		return path.relative(from, to);
	},

  directoryExists : function(path) {
    try {
      return fs.statSync(path).isDirectory();
    } catch (err) {
      return false;
    }
  },

	createDirectory : function(path) {
		fs.mkdirSync(path);
	},

	readFile: function(fileName) {
		try {
			return fs.readFileSync(fileName, 'utf8');
		} catch (err) {
			console.log(err);
			return false;
		}
	},

	writeFile: function(fileName, content) {
		try {
			fs.writeFileSync(fileName, content);
			return true
		} catch (err) {
			return false;
		}
	}
};
