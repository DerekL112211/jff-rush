# Hitbox Configuration Guide

## 如何調整 Hitbox 和 Attackbox

### Hitbox（碰撞箱）
Hitbox 定義角色的實際身體碰撞區域。由於精靈圖片有透明邊距（padding），我們需要縮小碰撞箱來匹配角色的實際身體。

```javascript
hitbox: {
    offset: { x: 40, y: 20 },  // 從精靈圖片位置的偏移量
    width: 40,   // 實際角色身體寬度
    height: 130  // 實際角色身體高度
}
```

#### 調整建議：
1. **offset.x**: 增加這個值會將碰撞箱向右移動（跳過左邊的透明區域）
2. **offset.y**: 增加這個值會將碰撞箱向下移動（跳過上方的透明區域）
3. **width**: 實際角色身體的寬度（通常比精靈圖小）
4. **height**: 實際角色身體的高度

### Attackbox（攻擊箱）
Attackbox 定義攻擊的範圍。

```javascript
attackBox: {
    offset: { x: 0, y: 50 },  // 攻擊箱相對於角色位置的偏移
    width: 120,   // 攻擊範圍（向前延伸）
    height: 80    // 攻擊高度
}
```

#### 調整建議：
1. **offset.x**: 攻擊箱的水平偏移（對於 P1 向右，P2 會自動反轉）
2. **offset.y**: 攻擊箱的垂直偏移（調整攻擊的高度位置）
3. **width**: 攻擊的前伸距離
4. **height**: 攻擊覆蓋的垂直範圍

## 如何測試和調整

1. **測試碰撞**：
   - 兩個角色靠近時，如果太早碰撞 → 減小 width 或增加 offset.x
   - 兩個角色重疊太多 → 增加 width 或減小 offset.x

2. **測試攻擊**：
   - 攻擊距離太短 → 增加 attackBox.width
   - 攻擊位置太高/太低 → 調整 attackBox.offset.y
   - 攻擊範圍太小 → 增加 attackBox.height

## 當前配置（G-Li）

- **Hitbox**: 40x130 像素，偏移 (40, 20)
  - 這會跳過精靈圖左邊約 40px 和上方 20px 的透明區域
  - 實際碰撞箱比精靈圖小得多，更貼合角色身體

- **Attackbox**: 120x80 像素，偏移 (0, 50)
  - 攻擊範圍向前延伸 120px
  - 攻擊高度覆蓋 80px
  - 垂直偏移 50px 使攻擊在角色中間位置

## 視覺化調試

如果需要看到實際的碰撞箱，可以在 Fighter.js 的 draw() 方法中添加調試繪製：

```javascript
// 在 Fighter.js 的 draw() 方法中添加：
// Draw hitbox (for debugging)
const hitbox = this.getHitbox();
c.strokeStyle = 'green';
c.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);

// Draw attackbox (for debugging)
c.strokeStyle = 'red';
c.strokeRect(this.attackBox.position.x, this.attackBox.position.y, 
             this.attackBox.width, this.attackBox.height);
```
