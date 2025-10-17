# IPv4 /24 CIDR full sky

- Total IPv4 Space in `/24`s: `16,777,216`
    - 4,096x4,096 pixel image if 1 pixel for each `/24`

### Zoom a single image

- TODO preset button to zoom into interesting blocks
    - https://zoomist.vercel.app/guides/methods-properties

### Raster tiles

- 512x512 tiles
    - 4 zoom levels (1x1, 2x2, 4x4, 8x8)
    - 85 tiles in total

### Non-Routable IPv4 Address Blocks:

| CIDR Block      | Number of /24s |
|-----------------|----------------|
| 0.0.0.0/8       | 65,536         |
| 10.0.0.0/8      | 65,536         |
| 100.64.0.0/10   | 4,096          |
| 127.0.0.0/8     | 65,536         |
| 169.254.0.0/16  | 256            |
| 172.16.0.0/12   | 4,096          |
| 192.0.0.0/24    | 1              |
| 192.0.2.0/24    | 1              |
| 192.88.99.0/24  | 1              |
| 192.168.0.0/16  | 256            |
| 198.18.0.0/15   | 512            |
| 198.51.100.0/24 | 1              |
| 203.0.113.0/24  | 1              |
| 224.0.0.0/4     | 1,048,576      |
| 240.0.0.0/4     | 1,048,576      |
| **Total**       | **2,302,949**  |

- Total Non-Routable Space in `/24`s: `2,302,949`
    - `16,777,216 - 2,302,949 = 14,474,267`

## Installation

```sh
brew install gdal
pip install --upgrade pip
pip install --upgrade -r requirements
```
