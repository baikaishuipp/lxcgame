/**
 * 在线图片素材配置
 * 
 * 如果你想使用在线图片而不是本地图片，
 * 请将这里的配置复制到 game.js 的 loadImages() 方法中
 */

// 方案1：使用PNG图标（来自免费CDN）
const ONLINE_IMAGES_ICONS = {
    // 使用Flaticon风格的图标
    destroyer: 'https://cdn-icons-png.flaticon.com/512/2721/2721285.png',
    frigate: 'https://cdn-icons-png.flaticon.com/512/2721/2721291.png',
    carrier: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png',
    submarineSmall: 'https://cdn-icons-png.flaticon.com/512/1048/1048326.png',
    submarineMedium: 'https://cdn-icons-png.flaticon.com/512/1048/1048326.png',
    submarineLarge: 'https://cdn-icons-png.flaticon.com/512/1048/1048326.png',
    missile: 'https://cdn-icons-png.flaticon.com/512/984/984101.png',
    explosion: 'https://cdn-icons-png.flaticon.com/512/785/785116.png'
};

// 方案2：使用表情符号风格（Twemoji CDN）
const ONLINE_IMAGES_EMOJI = {
    destroyer: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6a2.png', // 🚢
    frigate: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/26f4.png',   // ⛴️
    carrier: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6a2.png',  // 🚢
    submarineSmall: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f41f.png', // 🐟
    submarineMedium: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f420.png', // 🐠
    submarineLarge: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f433.png',  // 🐳
    missile: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f680.png',  // 🚀
    explosion: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a5.png' // 💥
};

// 方案3：使用OpenMoji（开源表情符号）
const ONLINE_IMAGES_OPENMOJI = {
    destroyer: 'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/1F6A2.svg',
    frigate: 'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/26F4.svg',
    carrier: 'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/1F6A2.svg',
    submarineSmall: 'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/1F41F.svg',
    submarineMedium: 'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/1F420.svg',
    submarineLarge: 'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/1F433.svg',
    missile: 'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/1F680.svg',
    explosion: 'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/1F4A5.svg'
};

/**
 * 使用方法：
 * 
 * 1. 打开 game.js 文件
 * 2. 找到 loadImages() 方法（约第80行）
 * 3. 将 imageUrls 对象替换为上面任意一个配置
 * 
 * 例如，要使用表情符号风格：
 * 
 * loadImages() {
 *     const imageUrls = {
 *         destroyer: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6a2.png',
 *         frigate: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/26f4.png',
 *         // ... 复制其他配置
 *     };
 *     // ... 其余代码保持不变
 * }
 */

// 导出配置（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ONLINE_IMAGES_ICONS,
        ONLINE_IMAGES_EMOJI,
        ONLINE_IMAGES_OPENMOJI
    };
}

