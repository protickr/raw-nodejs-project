// dependencies 
const fs = require('fs');
const path = require('path');

const lib = {};

// base directory of the data forlder 
lib.basedir = path.join(__dirname, '/../.data/');

// write data to file 
lib.create = function(dir, file, data, callback){
    // open file for writing 
    fs.open(lib.basedir + dir + '/' + file + '.json', 'wx', function(err1, fileDescriptor){
        if (!err1 && fileDescriptor){
            // convert data to string
            const stringData = JSON.stringify(data);

            // write data to file and then close it 
            fs.writeFile(fileDescriptor, stringData, function(err2){
                if(!err2){
                    fs.close(fileDescriptor, function(err3){
                        if(!err3){
                            callback(false);
                        } else {
                            callback('Error closing the new file!');
                        }
                    });
                } else {
                    callback('Error writing to new file!');
                }
            });
        } else {
            callback('Could not create new file, it may already exists');
        }
    });
};


// read data 
lib.read = (dir, file, callback) => {
    fs.readFile(lib.basedir + dir + '/' + file + '.json', 'utf8', (err, data)=>{
        callback(err, data);
    });
}; 


// update existing file 
lib.update = (dir, file, data, callback) => {
    // open file to update 
    fs.open(lib.basedir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            // convert the data to string 
            const stringData = JSON.stringify(data);

            // truncate the file 
            fs.ftruncate(fileDescriptor, (err)=>{
                if(!err){
                    // write to file and close it 
                    fs.writeFile(fileDescriptor, stringData, (err)=>{
                        if(!err){
                            // close the file
                            fs.close(fileDescriptor, (err)=>{
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error closing file!');
                                }
                            });
                        }else {
                            callback('Error writing to file');
                        }
                    });
                }else {
                    callback('Error truncating file');
                }
            });
        } else {
            console.log(`Error updating, File may not exist`);
        }
    });
};

// delete exisiting file 
lib.delete = (dir, file, callback) => {
    // unlink file 
    fs.unlink(lib.basedir + dir + '/' + file + '.json', (err)=>{
        if(!err){
            callback(false);
        }else {
            callback('Error deleting file');
        }
    });
};

// list all the items in the directory 
lib.list = (dir, callback) => {
    const targetDir = `${lib.basedir}${dir}`;

    fs.readdir(targetDir, (err, fileNames)=>{
        if(!fileNames.length)
            return callback(true, `there is no file in this directory, ${targetDir}`);
        
        if (err) 
            return callback(true, `Error Reading directory, ${err.message}`);
        
        let trimmedFileNames = fileNames.map(function (item, index, wholeArr) {
            return item.replace('.json', '');
        });
        
        return callback(false, trimmedFileNames);
    });
};

module.exports = lib;
