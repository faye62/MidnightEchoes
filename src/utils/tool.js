
const Utils = {}

Utils.copyForm = (sourceObject, targetObject) => {
  // 复制源对象的属性到目标对象中，只复制目标对象已经存在的属性
  for (const key in sourceObject) {
    if (targetObject.hasOwnProperty(key)) {
      targetObject[key] = sourceObject[key];
    }
  }
}
/**
 * 复制表单数据到table表格中
 * @param {Object} sourceObject 表单数据（所有字段）
 * @param {Array} targetList table表格的数据
 * targetList中的每一项是一个对象，对象中包含table表格的每一列的字段名和值
 */
Utils.copyFormTable = (sourceObject, targetList) => {
  for (const key in sourceObject) {
    for (const i in targetList) {
      if (targetList[i].hasOwnProperty(key)) { // 判断targetList中的每一项是否有key属性
        if (sourceObject[key] === null || sourceObject[key] === undefined) { // 如果表单数据中该字段的值为空，则将table表格中该字段的值设置为0
          targetList[i][key] = 0;
        } else {
          targetList[i][key] = sourceObject[key]
        }
      }
    }
  }
}
/**
* @param {Array} list table表格的数据
* */
Utils.copyTable = (list) => {
  let result = {}
  list.forEach(item => {
    result[item.key] = item[item.key]
    if (item.aclKey) {
      result[item.aclKey] = item[item.aclKey]
    }
  })
  return result
}

/**
* @param {Object} data 表单的所有数据
* @param {Array} urlKeys 表单中需要回填文件列表字段名称以及对应的文件列表
*[
  {
    name: 'businessLicenseUrl',
    fileList: businessFileList,
    obj: operationFormData
  },
]
* */
Utils.backUrlData = (data, urlKeys) => {
  console.log(data, 'tool')
  if (Object.keys(data).length === 0) return;
  for (let item in urlKeys) {
    const key = urlKeys[item].name
    const fileList = urlKeys[item].fileList
    if (data[key]) {
      fileList.value = [
        {
          name: '已上传的文件',
          url: data[key],
        }
      ]
    }
  }
  // 递归处理嵌套对象的情况
  for (let key in data) {
    if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key]) {
      Utils.backUrlData(data[key], urlKeys)
    }
  }
}
/* 回填需要多选的文件 */
Utils.backMultiUrlData = (data, key) => {
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  if (data.hasOwnProperty(key) && data[key]) {
    data[key] = data[key].split(',').filter(item => item);
  }
  console.log(data[key], 'tool')
}

Utils.findFirstEmptyField = (formData, notEmptyFields, isCheckZero = false) => {
  for (let key in formData) {
    if (isCheckZero && formData[key] == 0) {
      return false;
    }
    if ((formData[key] === ''.trim()
        ||
        (Array.isArray(formData[key]) && formData[key].length === 0))
      && !notEmptyFields.includes(key)
      || (!notEmptyFields.includes(key) && formData[key] === null)
      || (!notEmptyFields.includes(key) && formData[key] === undefined)) {
      return false; // 如果有任何一个属性为空，则返回false
    }
  }
  return true; // 如果所有属性都不为空，则返回true
}
Utils.validateFileSize = (file, maxSizeMB) => {
  return new Promise((resolve, reject) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // 将MB转换为字节
    if (file.size > maxSizeBytes) {
      reject(`文件大小超过限制，最大允许大小为 ${maxSizeMB}MB`);
    } else {
      resolve('文件大小符合要求');
    }
  });
}
Utils.checkImgSize = (file, size = 3, MIN_WIDTH = 200, MIN_HEIGHT = 200) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // const fileSizeInMB = file.size / (1024 * 1024); // Convert file size from bytes to MB
        if (img.width !== MIN_WIDTH || img.height !== MIN_HEIGHT) {
          reject(`图片尺寸不符合要求，请上传 ${MIN_WIDTH} * ${MIN_HEIGHT} 的图片`);
        } else {
          resolve();
        }
      }
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  })
}
Utils.formatArrToStr = (arr,char=',') => {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(item => item).join(char);
}
Utils.formatJsonToObj = (json) => {
  if (json === null || json === undefined || typeof json === 'object') return json;
  return JSON.parse(json);
}
Utils.formatStrToArr = (str,char=',') => {
  if (!str) return [];
  return str.split(char).filter(item => item);
}
/**
 * 校验表单列数据
 * @param {Boolean} isCheckZero 是否校验0值
 * @param {String} char 校验失败时返回的字符
 * @param {Object} row 单元格行数据
 * @param {String} cellValue 单元格值
 * @param {Number} column 列属性
 **/
Utils.validateCell = (row,column,cellValue,isCheckZero = false , char='--') => {
  // 如果值为 null 或 undefined，返回默认字符
  if (cellValue === null || cellValue === undefined) {
    return char;
  }

  // 如果 isCheckZero 为 true，且值为 0，返回默认字符
  if (isCheckZero && cellValue === 0) {
    return char;
  }

  // 如果值为空字符串，返回默认字符
  if (typeof cellValue === 'string' && cellValue.trim() === '') {
    return char;
  }
  // 其他情况返回原值
  return cellValue;
}
Utils.formatSexCell = (row,column,cellValue,isCheckZero = false , char='--') => {
  if (cellValue === null || cellValue === undefined) {
    return char;
  }
  switch (cellValue) {
   case '0':
      return '女';
   case '1':
      return '男';
    default:
      return char;
  }
}

export default Utils
