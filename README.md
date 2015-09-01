# divide-by-guides.jsx
A photoshop script to help people divide layout by guides

## 使用方法

1. 打开你的 `psd` 文件，拉好参考线
2. 双击 `divide-by-guides.jsx`，确定运行

## 配置

可以在你打开的 psd 目录下建立 `divide.json` 文件，然后按照如下配置：

```json
{
  "regions": [0,1,2,3],
  "name": ["region 0 的文件名", "region 1 的文件名", "region 2 的文件名", "region 3 的文件名"],
  "path": "./"
}

```

### 字段说明：
1. `regions`: 设置需要保存的 region。编号是按照从上到下、从左到右的顺序排列的。如下图：
![Order examples](order.png)
2. `name`: 每个 region 保存时的文件名。和上面 `regions` 字段的顺序是一一对应的；
3. `path`: 保存目录的路径。一般相对路径用的多一些，`./`就是保存在你打开的 `psd` 的相同目录下。
4. `"namePrefix`: 保存文件的文件名的公共前缀。
