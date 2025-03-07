### 预设类型

```ts
type Key = string | number | symbol
type Data = Record<string, unknown>
type RowPropFn<P = any> = (data: Data, index: number) => P
type DropType = 'before' | 'after' | 'none'

type Accessor<D = Data, Val extends string | number = string | number> = (
  data: D,
  index: number
) => Val
type RenderFn = (data: Data) => any
type ExpandRenderFn = (data: {
  leftFixed: number,
  rightFixed: number,
  row: Data,
  rowIndex: number
}) => any

type TableColumnType = 'order' | 'selection' | 'expand'

type FilterOptions<D = Data, Val extends string | number = string | number> =
  | {
    able: boolean,
    options: (string | { value: Val, label?: string, active?: boolean })[],
    multiple?: false,
    active?: null | Val,
    method?: null | ((active: Val, data: D) => boolean)
  }
  | {
    able: boolean,
    options: (string | { value: Val, label?: string, active?: boolean })[],
    multiple: true,
    active?: null | Val[],
    method?: null | ((active: Val[], data: D) => boolean)
  }

interface ParsedFilterOptions extends Omit<Required<FilterOptions>, 'options'> {
  options: { value: string | number, label: string, active: boolean }[]
}

interface SorterOptions<D = Data> {
  able: boolean,
  type?: null | 'asc' | 'desc',
  order?: number, // 优先级
  method?: null | ((prev: D, next: D) => number)
}

type ParsedSorterOptions = Required<SorterOptions>

interface BaseColumn<D = Data, Val extends string | number = string | number> {
  name: string,
  key?: keyof D,
  metaData?: Data,
  fixed?: boolean | 'left' | 'right',
  className?: ClassType,
  style?: StyleType,
  attrs?: Record<string, any>,
  width?: number,
  filter?: FilterOptions<D, Val>,
  sorter?: boolean | SorterOptions<D>,
  order?: number,
  noEllipsis?: boolean,
  accessor?: Accessor<D, Val>,
  renderer?: RenderFn,
  headRenderer?: RenderFn
}

interface OrderColumn<D = Data, Val extends string | number = string | number>
  extends BaseColumn<D, Val> {
  type: 'order',
  truthIndex?: boolean,
  orderLabel?: (index: number) => string | number
}

interface SelectionColumn<D = Data, Val extends string | number = string | number>
  extends BaseColumn<D, Val> {
  type: 'selection',
  checkboxSize?: ComponentSize,
  disableRow?: (data: Data) => boolean
}

interface ExpandColumn<D = Data, Val extends string | number = string | number>
  extends BaseColumn<D, Val> {
  type: 'expand',
  disableRow?: (data: Data) => boolean
}

type TypeColumn<D = Data, Val extends string | number = string | number> =
  | OrderColumn<D, Val>
  | SelectionColumn<D, Val>
  | ExpandColumn<D, Val>
type TableColumnOptions<D = Data, Val extends string | number = string | number> =
  | BaseColumn<D, Val>
  | TypeColumn<D, Val>
type ColumnWithKey<
  D = Data,
  Val extends string | number = string | number
> = TableColumnOptions<D, Val> & { key: Key }

type CellPropFn<P = any> = (
  data: Data,
  column: ColumnWithKey,
  rowIndex: number,
  columnIndex: number
) => P
type HeadPropFn<P = any> = (column: ColumnWithKey, index: number) => P

type ColumnProfile<D = Data, Val extends string | number = string | number> = Pick<
  ColumnWithKey<D, Val>,
  'name' | 'key' | 'metaData'
>
type FilterProfile<D = Data, Val extends string | number = string | number> = ColumnProfile<
  D,
  Val
> & {
  active: Val | Val[]
}
type SorterProfile<D = Data, Val extends string | number = string | number> = ColumnProfile<
  D,
  Val
> & {
  type: 'asc' | 'desc'
}

interface TableRowPayload {
  row: Data,
  key: Key,
  index: number,
  event: Event
}

interface TableCellPayload {
  row: Data,
  key: Key,
  rowIndex: number,
  column: TableColumnOptions,
  columnIndex: number,
  event: Event
}

interface TableHeadPayload {
  column: TableColumnOptions,
  index: number,
  event: Event
}
```

### Table 属性

| 名称            | 类型                                                     | 说明                                                         | 默认值         | 始于    |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------ | -------------- | ------- |
| columns         | `TableColumnOptions<any, any>[]`                         | 表格列的配置，参考下方的 TableColumn 属性                    | `[]`           | -       |
| data            | `Data[]`                                                 | 表格的数据源                                                 | `[]`           | -       |
| data-key        | `string`                                                 | 数据源的索引字段，该字段的值需要在数据源中唯一               | `'id'`         | -       |
| width           | `number`                                                 | 表格的宽度，在有固定列时使用                                 | `null`         | -       |
| height          | `number`                                                 | 表格的高度，超出这个高度时会变成可滚动状态                   | `null`         | -       |
| row-class       | `ClassType \| RowPropFn<ClassType>`                      | 行的自定义类名                                               | `null`         | -       |
| row-style       | `StyleType \| RowPropFn<StyleType>`                      | 行的自定义样式                                               | `null`         | `2.0.1` |
| row-attrs       | `Record<string, any> \| RowPropFn<Record<string, any>>`  | 行的自定义属性                                               | `null`         | `2.0.1` |
| cell-class      | `ClassType \| CellPropFn<ClassType>`                     | 单元格的自定义类名                                           | `null`         | `2.0.1` |
| cell-style      | `StyleType \| CellPropFn<StyleType>`                     | 单元格的自定义样式                                           | `null`         | `2.0.1` |
| cell-attrs      | `Record<string, any> \| CellPropFn<Record<string, any>>` | 单元格的自定义属性                                           | `null`         | `2.0.1` |
| head-class      | `ClassType \| HeadPropFn<ClassType>`                     | 表头单元格的自定义类名                                       | `null`         | `2.0.1` |
| head-style      | `StyleType \| HeadPropFn<StyleType>`                     | 表头单元格的自定义样式                                       | `null`         | `2.0.1` |
| head-attrs      | `Record<string, any> \| HeadPropFn<Record<string, any>>` | 表头单元格的自定义属性                                       | `null`         | `2.0.1` |
| stripe          | `boolean`                                                | 设置表格是否应用斑马纹                                       | `false`        | -       |
| border          | `boolean`                                                | 设置表格是否具有外边框和纵向边框                             | `false`        | -       |
| highlight       | `boolean`                                                | 设置表格行是否在鼠标移入时高亮                               | `false`        | -       |
| use-y-bar       | `boolean`                                                | 设置表格是否使用纵向滚动条                                   | `false`        | -       |
| bar-fade        | `number`                                                 | 设置滚动条的渐隐时间，若小于 `300` 则关闭渐隐效果            | `1500`         | -       |
| scroll-delta-y  | `number`                                                 | 设置表格纵向每次滚动的距离                                   | `20`           | -       |
| row-draggable   | `boolean`                                                | 设置表格行是否可以拖拽排序                                   | `false`        | -       |
| row-height      | `number`                                                 | 设置表格的行高，未设置时表格行高将会动态计算                 | `null`         | -       |
| render-count    | `number`                                                 | 设置表格的最大渲染行数，通常用于大量数据渲染，需设置固定行高 | `null`         | -       |
| scroll-class    | `ScrollClass`                                            | 设置表格各滚动组件的自定义类型                               | `{}`           | -       |
| expand-renderer | `ExpandRenderFn`                                         | 设置行拓展内容的渲染方法                                     | `null`         | -       |
| current-page    | `number`                                                 | 设置表格当前显示的数据页                                     | `1`            | -       |
| page-size       | `number`                                                 | 设置表格每页的数据量，当为 `0` 时则禁用分页                  | `0`            | -       |
| transparent     | `boolean`                                                | 设置是否为透明表格，该属性优先级低于其他内置样式属性         | `false`        | -       |
| empty-text      | `string`                                                 | 设置表格空数据时的提示语                                     | `locale.empty` | -       |
| single-sorter   | `boolean`                                                | 设置后将限制表格只能有一列开启排序                           | `false`        | -       |
| single-filter   | `boolean`                                                | 设置后将限制表格只能有一列开启过滤                           | `false`        | -       |

### Table 事件

| 名称             | 说明                                                                         | 参数                                                                                    | 始于    |
| ---------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------- |
| body-scroll      | 当表格纵向滚动时触发，返回一个包含滚动偏移量和滚动百分比的对象               | `(scroll: { client: number, percent: number })`                                         | -       |
| row-enter        | 当鼠标移入了行时触发，返回行数据、行索引和行的位置索引                       | `(payload: TableRowPayload)`                                                            | -       |
| row-leave        | 当鼠标移出了行时触发，返回行数据、行索引和行的位置索引                       | `(payload: TableRowPayload)`                                                            | -       |
| row-click        | 当点击了行时触发，返回行数据、行索引和行的位置索引                           | `(payload: TableRowPayload)`                                                            | -       |
| row-dblclick     | 当双击了行时触发，返回行数据、行索引和行的位置索引                           | `(payload: TableRowPayload)`                                                            | `2.0.1` |
| row-contextmenu  | 当右击了行时触发，返回行数据、行索引和行的位置索引                           | `(payload: TableRowPayload)`                                                            | `2.0.1` |
| row-check        | 当勾选了行复选框时触发，返回行数据、勾选状态、行索引和行的位置索引           | `(payload: Omit<TableRowPayload, 'event'> & { checked: boolean })`                      | -       |
| row-check-all    | 当进行了全选时触发，返回当前是否为全选状态以及是否处于部分全选状态           | `(checked: boolean, partial: boolean)`                                                  | -       |
| row-expand       | 当行拓展内容的展开状态改变时触发，返回行数据、展开状态、行索引和行的位置索引 | `(payload: Omit<TableRowPayload, 'event'> & { expanded: boolean })`                     | -       |
| row-drag-start   | 当行将要开始拖拽时触发，返回当前行的数据                                     | `(data: Record<string, unknown>, event: DragEvent)`                                     | -       |
| row-drag-over    | 当行正在拖拽时触发，返回前行的数据                                           | `(data: Record<string, unknown>, event: DragEvent)`                                     | -       |
| row-drop         | 当行被其他的拖拽行放入时触发，返回当前行的数据和放入类型（前放和后放）       | `(data: Record<string, unknown>, dropType?: 'before' \| 'after', event: DragEvent)`     | -       |
| row-drag-end     | 当行结束拖拽时触发，返回前行的数据和所有行的数据                             | `(data: Record<string, unknown>, allData: Record<string, unknown>[], event: DragEvent)` | -       |
| row-filter       | 当发生表格数据过滤时触发，返回参与了过滤的列信息与过滤后的数据               | `(profiles: FilterProfile[], filteredRow: Data[])`                                      | -       |
| row-sort         | 当发生表格数据排序时触发，返回参与了排序的列信息与排序后的数据               | `(profiles: SortProfile[], sortedRow: Data[])`                                          | -       |
| cell-enter       | 当鼠标移入了单元格时触发，返回行数据、行索引、行的位置索引、列数据和列索引   | `(payload: TableCellPayload)`                                                           | `2.0.1` |
| cell-leave       | 当鼠标移出了单元格时触发，返回行数据、行索引、行的位置索引、列数据和列索引   | `(payload: TableCellPayload)`                                                           | `2.0.1` |
| cell-click       | 当点击了单元格时触发，返回行数据、行索引、行的位置索引、列数据和列索引       | `(payload: TableCellPayload)`                                                           | `2.0.1` |
| cell-dblclick    | 当双击了单元格时触发，返回行数据、行索引、行的位置索引、列数据和列索引       | `(payload: TableCellPayload)`                                                           | `2.0.1` |
| cell-contextmenu | 当右击了单元格时触发，返回行数据、行索引、行的位置索引、列数据和列索引       | `(payload: TableCellPayload)`                                                           | `2.0.1` |
| head-enter       | 当鼠标移入了头部单元格时触发，返回列数据和列索引                             | `(payload: TableHeadPayload)`                                                           | `2.0.1` |
| head-leave       | 当鼠标移出了头部单元格时触发，返回列数据和列索引                             | `(payload: TableHeadPayload)`                                                           | `2.0.1` |
| head-click       | 当点击了头部单元格时触发，返回列数据和列索引                                 | `(payload: TableHeadPayload)`                                                           | `2.0.1` |
| head-dblclick    | 当双击了头部单元格时触发，返回列数据和列索引                                 | `(payload: TableHeadPayload)`                                                           | `2.0.1` |
| head-contextmenu | 当右击了头部单元格时触发，返回列数据和列索引                                 | `(payload: TableHeadPayload)`                                                           | `2.0.1` |

### Table 插槽

| 名称    | 说明                                        | 参数                 | 始于 |
| ------- | ------------------------------------------- | -------------------- | ---- |
| default | 表格列的插槽，应使用 TabelColumn 组件定义列 | -                    | -    |
| empty   | 空数据提示内容的插槽                        | `(isFixed: boolean)` | -    |

### Table 方法

| 名称          | 说明                                       | 签名                              | 始于 |
| ------------- | ------------------------------------------ | --------------------------------- | ---- |
| clearSort     | 清除表格当前激活的所有排序                 | `() => void`                      | -    |
| clearFilter   | 清除当前表格激活的所有过滤                 | `() => void`                      | -    |
| refresh       | 重置表格，将会触发表格的重新布局及数据渲染 | `() => void`                      | -    |
| getSelected   | 获取所有被勾选的行数据                     | `() => Record<string, unknown>[]` | -    |
| clearSelected | 清除所有被勾选的行数据                     | `() => void`                      | -    |

### TableColumn 属性

| 名称          | 类型                                   | 说明                                                                         | 默认值      | 始于    |
| ------------- | -------------------------------------- | ---------------------------------------------------------------------------- | ----------- | ------- |
| name          | `string`                               | 列的名称                                                                     | `''`        | -       |
| key \| id-key | `string \| number`                     | 列的唯一索引，使用模版列时请使用 `id-key` 代替                               | `''`        | -       |
| accessor      | `(data: any, rowIndex: number) => any` | 该列的数据读取方法，接收行数据和行位置索引，若不定义这按索引值从行数据上读取 | `null`      | -       |
| fixed         | `boolean \| 'left' \| 'right'`         | 是否为固定列，可选值为 `left`、`right`，设置为 `true` 时固定在左侧           | `false`     | -       |
| class-name    | `ClassType`                            | 该列单元格的自定义类名                                                       | `null`      | -       |
| style         | `StyleType`                            | 列的自定义样式                                                               | `null`      | `2.0.1` |
| attrs         | `Record<string, any>`                  | 列的自定义属性                                                               | `null`      | `2.0.1` |
| type          | `'order' \| 'selection' \| 'expand'`   | 设置内置特定类型列                                                           | `null`      | -       |
| width         | `number`                               | 设置列宽                                                                     | `null`      | -       |
| filter        | `FilterOptions<any, any>`              | 列的过滤配置器                                                               | `null`      | -       |
| sorter        | `boolean \| SorterOptions<any>`        | 列的排序排序器                                                               | `null`      | -       |
| order         | `number`                               | 列的渲染顺序                                                                 | `0`         | -       |
| renderer      | `ColumnRenderFn`                       | 自定义渲染函数                                                               | `null`      | -       |
| head-renderer | `HeadRenderFn`                         | 自定义头部渲染函数                                                           | `null`      | -       |
| no-ellipsis   | `boolean`                              | 是否禁用单元格的省略组件                                                     | `false`     | -       |
| checkbox-size | `'small' \| 'default' \| 'large'`      | 当 `type` 为 `'selection'` 时设置复选框大小                                  | `'default'` | -       |
| disable-row   | `(data: Data) => boolean`              | 设置禁用行的回调函数                                                         | `null`      | -       |
| truth-index   | `boolean`                              | 当 `type` 为 `'order'` 时设置是否使用行真实（全局）索引                      | `false`     | -       |
| order-label   | `(index: number) => string \| number`  | 当 `type` 为 `'order'` 时设置索引显示内容的回调函数                          | `null`      | -       |
| meta-data     | `Data`                                 | 设置列的元数据                                                               | `{}`        | -       |

### TableColumn 插槽

| 名称    | 说明           | 参数                                                                                                            | 始于 |
| ------- | -------------- | --------------------------------------------------------------------------------------------------------------- | ---- |
| default | 列内容的插槽   | `{ row: Record<string, unknown>, rowIndex: number, column: TableColumnOptions<any, any>, columnIndex: number }` | -    |
| head    | 列头内容的插槽 | `{ column: TableColumnOptions<any, any>, columnIndex: number }`                                                 | -    |

### TableSorter 属性

| 名称   | 类型                               | 说明                                 | 默认值  | 始于 |
| ------ | ---------------------------------- | ------------------------------------ | ------- | ---- |
| able   | `boolean`                          | 设置是否可以排序                     | `false` | -    |
| type   | `'asc' \| 'desc'`                  | 排序的类型                           | `null`  | -    |
| order  | `number`                           | 在多列排序时用于规定各列的先后顺序   | `0`     | -    |
| method | `(prev: any, next: any) => number` | 自定义排序的方法，分别接收前后行数据 | `null`  | -    |

### TableFilter 属性

| 名称     | 类型                                                             | 说明                                         | 默认值  | 始于 |
| -------- | ---------------------------------------------------------------- | -------------------------------------------- | ------- | ---- |
| able     | `boolean`                                                        | 设置是否可以过滤                             | `false` | -    |
| options  | `(string \| { value: any, label?: string, active?: boolean })[]` | 过滤的选项，元素为 `{ label, value }` 的对象 | `[]`    | -    |
| multiple | `boolean`                                                        | 是否开启多条件过滤                           | `false` | -    |
| active   | `any`                                                            | 当前过滤的依赖值，会传入过滤方法             | `null`  | -    |
| method   | `(active: any \| any[], data: any) => boolean`                   | 过滤的方法，接收过滤的依赖值和行数据         | `null`  | -    |
