# 🔧 Hitbox 物理分離修復

## 問題描述

之前的系統中，`this.width` 和 `this.height` 被用於兩個不同的目的：
1. **碰撞檢測** - 角色之間的碰撞（hitbox）
2. **物理計算** - 地面碰撞、邊界檢測

當 hitbox 隨著動作變化時（例如跳躍時變小），會導致：
- ❌ 角色在地面上的高度變化（跳躍時 hitbox 變小 → 角色"沉"到地下）
- ❌ 邊界檢測不一致（不同動作時邊界位置不同）
- ❌ 物理行為不穩定

## 解決方案

### 分離 Hitbox 和 Physics 尺寸

```javascript
// 在 Fighter 構造函數中
this.physicsWidth = hitbox.width;   // 固定的物理寬度（不變）
this.physicsHeight = hitbox.height; // 固定的物理高度（不變）

this.width = hitbox.width;          // 當前 hitbox 寬度（會變）
this.height = hitbox.height;        // 當前 hitbox 高度（會變）
```

### 使用場景

#### 物理計算（使用固定值）
```javascript
// 地面碰撞
if (this.position.y + this.physicsHeight >= groundLevel) {
    this.position.y = groundLevel - this.physicsHeight;
}

// 邊界檢測
if (this.position.x + this.physicsWidth > canvasWidth) {
    this.position.x = canvasWidth - this.physicsWidth;
}

// 攻擊箱位置（敵人）
this.attackBox.position.x = this.position.x - this.attackBox.width + this.physicsWidth;
```

#### 碰撞檢測（使用動態值）
```javascript
// Hitbox（會隨動作變化）
getHitbox() {
    return {
        x: this.position.x + this.hitboxOffset.x,
        y: this.position.y + this.hitboxOffset.y,
        width: this.width,   // 當前動作的 hitbox 寬度
        height: this.height  // 當前動作的 hitbox 高度
    };
}
```

## 修復效果

### 之前（Bug）
```
Idle:  height = 128  →  站在地面 Y = 480
Jump:  height = 110  →  站在地面 Y = 498  ❌ 沉下去了！
Death: height = 40   →  站在地面 Y = 588  ❌ 掉到地下！
```

### 之後（修復）
```
Idle:  physicsHeight = 128  →  站在地面 Y = 480
Jump:  physicsHeight = 128  →  站在地面 Y = 480  ✅ 位置固定
Death: physicsHeight = 128  →  站在地面 Y = 480  ✅ 位置固定

但是碰撞箱會正確變化：
Idle:  hitbox height = 128  ✅ 正確的碰撞範圍
Jump:  hitbox height = 110  ✅ 跳躍時碰撞箱變小
Death: hitbox height = 40   ✅ 倒地時碰撞箱變矮
```

## 技術細節

### physicsWidth 和 physicsHeight
- **用途**: 物理計算（地面碰撞、邊界、攻擊箱位置）
- **特點**: 永遠不變，遊戲開始時設定
- **基於**: 默認 hitbox（通常是 idle/run 的平均值）

### width 和 height  
- **用途**: 實際碰撞檢測（角色之間的碰撞）
- **特點**: 隨動作變化（通過 updateHitbox()）
- **基於**: 當前動作的 hitbox 設定

## 為什麼這樣設計？

### 1. 穩定的物理系統
- 角色站在地面上的位置不會因為動作改變而變化
- 邊界檢測一致
- 攻擊箱位置穩定

### 2. 靈活的碰撞檢測
- 跳躍時 hitbox 變小 → 更難被打中（合理）
- 攻擊時 hitbox 可能變大 → 風險與回報
- 死亡時 hitbox 變矮 → 符合倒地姿勢

### 3. 遊戲平衡
- 物理系統的一致性保證公平
- 動態 hitbox 增加策略性

## 類比（現實世界）

想像一個拳擊手：

### 物理尺寸（physicsHeight）
- 他的"站立空間"是固定的
- 不管他蹲下還是跳起，他佔據的地面位置不變
- 就像拳擊台上的一個方格

### 碰撞箱（height）
- 他的"可被打中的區域"會變化
- 蹲下時 → 碰撞箱變小（更難被打到頭）
- 跳起時 → 碰撞箱也變小（在空中收縮身體）
- 但他仍然站在同一個方格上

## 測試

修復後，你應該看到：
✅ 所有動作時角色都穩定地站在地面上
✅ 跳躍、攻擊、死亡時 Y 座標不會亂跳
✅ 邊界碰撞一致（不會因為動作而穿牆）
✅ 但碰撞檢測仍然準確（不同動作有不同的碰撞範圍）

## 總結

通過分離 **物理尺寸** 和 **碰撞箱**，我們實現了：
- 🎮 穩定的物理系統（角色不會在地面上浮動）
- 🥊 精確的碰撞檢測（每個動作有正確的 hitbox）
- ⚖️ 公平的遊戲機制（物理一致，碰撞靈活）

這就是專業格鬥遊戲的標準做法！
