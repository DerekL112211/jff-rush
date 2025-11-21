# 🎯 Hitbox Detector - 使用指南

## 什麼是 Hitbox Detector？

Hitbox Detector 是一個自動分析精靈圖片並計算最佳碰撞箱尺寸的工具。它會掃描圖片的所有像素，找出非透明區域的邊界，從而確定角色的實際身體範圍。

## 📦 包含的工具

### 1. **HitboxDetector.js** - JavaScript 類庫
位置：`js/utils/HitboxDetector.js`

功能：
- 自動檢測圖片中的非透明像素
- 計算 offset、width、height
- 支持批量分析多個精靈圖
- 可以視覺化調試

### 2. **hitbox-detector.html** - 視覺化工具
位置：`hitbox-detector.html`

功能：
- 視覺化界面，拖放上傳圖片
- 實時預覽檢測結果
- 調整透明度閾值
- 自動生成配置代碼
- 顯示縮放後的尺寸

## 🚀 快速開始

### 方法 1: 使用視覺化工具（推薦）

1. **打開工具頁面**
   ```
   在瀏覽器中打開：file:///z:/JFFT/Games/jff-rush/hitbox-detector.html
   ```

2. **上傳精靈圖片**
   - 點擊「選擇精靈圖片」按鈕
   - 選擇你的角色精靈圖（例如：`sprite/p1/idle.png`）

3. **調整參數**
   - **透明度閾值**：控制多透明算「透明」（0-255，推薦 50）
   - **縮放比例**：輸入你的角色 scale 值（例如：0.4）

4. **分析**
   - 點擊「🔍 分析 Hitbox」按鈕
   - 查看綠色框（原始）和紅色框（縮放後）
   - 複製生成的配置代碼

5. **應用到角色配置**
   - 將生成的代碼貼到 `js/config/characters/gli.js` 中

### 方法 2: 在代碼中使用

```javascript
import { HitboxDetector } from './js/utils/HitboxDetector.js';

// 從 URL 檢測
const hitbox = await HitboxDetector.detectFromUrl('./sprite/p1/idle.png');
console.log(hitbox);
// 輸出：{ offset: { x: 40, y: 20 }, width: 40, height: 130, ... }

// 應用縮放
const scale = 0.4;
const scaledHitbox = {
    offset: {
        x: Math.round(hitbox.offset.x * scale),
        y: Math.round(hitbox.offset.y * scale)
    },
    width: Math.round(hitbox.width * scale),
    height: Math.round(hitbox.height * scale)
};
```

### 方法 3: 批量分析所有精靈

```javascript
import { HitboxDetector } from './js/utils/HitboxDetector.js';
import characterConfig from './js/config/characters/gli.js';

// 分析角色的所有精靈圖
const results = await HitboxDetector.analyzeCharacter(characterConfig);

// 查看結果
console.log('Idle hitbox:', results.idle);
console.log('Run hitbox:', results.run);
console.log('Attack hitbox:', results.attack1);

// 計算平均值（用於基本動作）
const avgHitbox = HitboxDetector.getAverageHitbox([
    results.idle,
    results.run
]);
console.log('Average hitbox:', avgHitbox);
```

## 🎨 在遊戲中視覺化調試

在 `Fighter.js` 的 `draw()` 方法中添加：

```javascript
draw(c) {
    c.drawImage(
        this.image,
        this.framesCurrent * (this.image.width / this.framesMax),
        0,
        this.image.width / this.framesMax,
        this.image.height,
        this.position.x - this.offset.x,
        this.position.y - this.offset.y,
        (this.image.width / this.framesMax) * this.scale,
        this.image.height * this.scale
    );

    // === 添加這裡：視覺化 Hitbox ===
    const hitbox = this.getHitbox();
    c.strokeStyle = 'lime';
    c.lineWidth = 2;
    c.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    
    // 視覺化 AttackBox
    c.strokeStyle = 'red';
    c.strokeRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height
    );
}
```

## ⚙️ 參數說明

### Alpha Threshold（透明度閾值）
- **範圍**：0-255
- **推薦值**：50
- **說明**：
  - 值越低 = 更多像素被視為「不透明」→ Hitbox 更大
  - 值越高 = 更少像素被視為「不透明」→ Hitbox 更小
  - 調整這個值可以處理半透明的陰影或光暈

### Scale（縮放比例）
- **說明**：角色在遊戲中的縮放比例
- **例子**：如果精靈圖是 200x400，scale 是 0.4，遊戲中顯示為 80x160
- **重要**：檢測到的 hitbox 需要乘以 scale 才能用於遊戲配置

## 📋 輸出結果說明

```javascript
{
    offset: { x: 40, y: 20 },     // 從精靈圖左上角的偏移
    width: 100,                    // Hitbox 寬度
    height: 150,                   // Hitbox 高度
    bounds: {                      // 原始邊界值
        minX: 40, minY: 20,
        maxX: 140, maxY: 170
    },
    imageSize: {                   // 原始圖片尺寸
        width: 200, height: 200
    }
}
```

## 💡 使用建議

1. **不同動作使用不同 Hitbox**
   - Idle/Run：使用平均值
   - Attack：可以稍微大一點
   - Crouch/Block：可能需要更矮

2. **微調**
   - 自動檢測是起點，但可能需要手動微調
   - 考慮遊戲平衡性，不一定要 100% 精確

3. **測試**
   - 在遊戲中啟用視覺化調試
   - 測試角色碰撞、攻擊判定是否合理

4. **批量處理**
   - 為所有角色的所有動作生成 hitbox
   - 保存結果以便後續使用

## 🔧 常見問題

**Q: 檢測到的 Hitbox 太大/太小？**
A: 調整 Alpha Threshold 值。值越低，Hitbox 越大。

**Q: 如何處理多幀動畫？**
A: 目前工具分析整個精靈圖。如果是多幀，需要手動裁剪單幀或使用平均值。

**Q: CORS 錯誤？**
A: 確保從本地伺服器運行（例如 Live Server），而不是直接打開 HTML 文件。

**Q: 可以用於 GIF 動畫嗎？**
A: 不直接支持。請先將 GIF 轉換為 PNG 精靈圖表。

## 📚 API 參考

### `HitboxDetector.detectFromUrl(imageSrc, alphaThreshold)`
從圖片 URL 檢測 hitbox

### `HitboxDetector.detectFromImage(image, alphaThreshold)`
從 HTMLImageElement 檢測 hitbox

### `HitboxDetector.analyzeCharacter(characterConfig, alphaThreshold)`
分析角色配置中的所有精靈

### `HitboxDetector.getAverageHitbox(hitboxResults)`
計算多個 hitbox 的平均值

### `HitboxDetector.drawDebugBox(ctx, hitbox, x, y, scale)`
在 canvas 上繪製 hitbox（用於調試）

## 🌟 下一步

1. 使用工具分析你的所有角色精靈
2. 生成最佳的 hitbox 配置
3. 在遊戲中測試和微調
4. 為每個角色創建最佳的碰撞體驗！
