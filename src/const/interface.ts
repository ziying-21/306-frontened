export interface User {
  username: string;
  password: string;
}

export interface Problem {
  description: string;
}

export interface TextClassificationProblem extends Problem {
  options: string[];
  data?: boolean[];
}

export interface ImagesClassificationProblem extends Problem {
  /** 图片url */
  options: string[];
  data?: boolean[];
}

export interface FaceTagProblem extends Problem {
  url: string;
  /** 点坐标数组 */
  data?: {
    x: number;
    y: number;
  }[];
}

export interface ImageFrameProblem extends Problem {
  url: string;
  /** 图片框选矩形，左下和右上确定矩形 */
  data?: {
    x: number; // leftup x
    y: number;
    width: number;
    height: number;
  }[];
}

export interface SentenceSortProblem extends Problem {
  data?: {
    key: number; //从1开始
    content: string;
  }[]
}

export interface TagProblem extends Problem {
  url: string;
  /** 有些选项需要标注方填写 */
  choice: {
    text: string;
    needInput: boolean;
  }[];
  data?: {
    choiceIndex: number;
    input?: string;
  };
}

export interface TextTripleProblem extends Problem {
  description: string;
  text: string;
  data?: {
    subject: string;
    object: string;
    relation: string;
  };
}

export interface TextReviewProblem extends Problem {
  content: string;
  data?: boolean;
}

export interface FileReviewProblem extends Problem {
  url: string;
  data?: boolean;
}

export interface PointsCloud {
  description: string;
}

export interface TaskInfo {
  task_id?: number;
  title: string;
  create_at: number;
  deadline: number;
  template:
    | "TextClassification"
    | "ImagesClassification"
    | "FaceTag"
    | "ImageFrame"
    | "SoundTag"
    | "VideoTag"
    | "TextTriple"
    | "TextReview"
    | "ImageReview"
    | "VideoReview"
    | "AudioReview"
    | "Custom"
    | "SentenceSort";
  reward: number;
  time: number;
  labeler_number: number;
  demander_id?: number;
  batch: boolean;
  type: "sentiment" | "part-of-speech" | "intent" | "event";
  distribute: "system" | "agent";
  distribute_type?: "order" | "smart" | "correct" | "fast";
  priority?: number;
  agent_username?: string;
  task_data?:
    | TextClassificationProblem[]
    | ImagesClassificationProblem[]
    | FaceTagProblem[]
    | ImageFrameProblem[]
    | TagProblem[]
    | TextTripleProblem[]
    | TextReviewProblem[]
    | FileReviewProblem[]
    | Problem[];
  batch_file?: string;
}

export interface TextClassificationData {
  label_data: boolean[][];
}
export function isTextTripleProblem(data: any): data is TextTripleProblem {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.description === "string" &&
    typeof data.text === "string" &&
    (data.triple === undefined ||
      (data.triple !== null &&
        data.triple === "object" &&
        typeof data.triple.subject === "string" &&
        typeof data.triple.object === "string" &&
        typeof data.triple.relation === "string"))
  );
}

export function isFaceTagProblem(data: any): data is FaceTagProblem {
  return (
    typeof data.description === "string" &&
    typeof data.url === "string" &&
    (data.data === undefined ||
      (Array.isArray(data.data) &&
        data.data.every(
          (point: any) =>
            typeof point === "object" && typeof point.x === "number" && typeof point.y === "number"
        )))
  );
}
export function isImageFrameProblem(data: any): data is ImageFrameProblem {
  return (
    typeof data.description === "string" &&
    typeof data.url === "string" &&
    (data.data === undefined ||
      (Array.isArray(data.data) &&
        data.data.every((rect: any) => {
          return (
            typeof rect === "object" &&
            typeof rect.x === "number" &&
            typeof rect.y === "number" &&
            typeof rect.width === "number" &&
            typeof rect.height === "number"
          );
        })))
  );
}

export function isClassificationProblem(data: any): data is TextClassificationProblem {
  return (
    typeof data.description === "string" &&
    Array.isArray(data.options) &&
    (data.data === undefined || Array.isArray(data.data))
  );
}
export function isTextClassificationProblem(data: any): data is TextClassificationProblem {
  return (
    typeof data.description === "string" &&
    Array.isArray(data.options) &&
    (data.data === undefined || Array.isArray(data.data))
  );
}
export function isImagesClassificationProblem(data: any): data is TextClassificationProblem {
  return (
    typeof data.description === "string" &&
    Array.isArray(data.options) &&
    (data.data === undefined || Array.isArray(data.data))
  );
}
export function isTagProblem(data: any): data is TagProblem {
  return (
    typeof data.description === "string" &&
    typeof data.url === "string" &&
    Array.isArray(data.choice) &&
    data.choice.every((c: any) => {
      return typeof c.text === "string" && typeof c.needInput === "boolean";
    }) &&
    (data.data === undefined ||
      (typeof data.data.choiceIndex === "number" &&
        (data.data.input === undefined || typeof data.data.input === "string")))
  );
}

type StateColor = {
  color: string;
  description: string;
  show: string;
};

type StateColors = {
  [state: string | number]: StateColor;
};

export const mapState2ColorChinese: StateColors = {
  0: { color: "rgb(160, 227, 109)", description: "已分发", show: "任务已分发，等待对方接受" },
  1: { color: "rgb(203, 8, 21)", description: "已拒绝", show: "对方拒绝了你的任务" },
  2: { color: "rgb(33, 198, 198)", description: "标注中", show: "对方正在对你的任务进行标注" },
  3: { color: "#c8c027", description: "待审核", show: "对方已完成标注，请对这个标注进行审核" },
  4: { color: "rgb(33, 198, 39)", description: "已完成", show: "对方已完成标注请通过了审核" },
  5: { color: "rgb(252, 61, 14)", description: "不合格", show: "对方的标注不合格" },
  6: { color: "rgb(221, 136, 32)", description: "已过期", show: "该标注方没有在规定时间内提交标注"},

  blocked: { color: "rgb(252, 61, 14)", description: "已封禁", show: "该账号已被封禁" },
  unblocked: { color: "rgb(33, 198, 39)", description: "正常", show: "该账号可以正常使用" },

  admin_checking: {
    color: "rgb(221, 202, 32)",
    description: "待管理员审核",
    show: "任务已创建，请等待管理员审核",
  },
  distributing: {
    color: "rgb(160, 227, 109)",
    description: "分发中",
    show: "接受您的任务的标注方人数尚不足您的需求，我们正在尽力分发",
  },
  labeling: {
    color: "rgb(33, 198, 198)",
    description: "标注中",
    show: "标注方正在对您的任务做标注",
  },
  checking: { color: "#c8c027", description: "待审核", show: "已经有标注方完成任务，请审核" },
  completed: {
    color: "rgb(33, 198, 39)",
    description: "已完成",
    show: "任务已完成，您可以导出数据了",
  },
  overdue: {
    color: "rgb(252, 61, 14)",
    description: "已过期",
    show: "任务已过期，您可以选择导出现有数据或重新分发",
  },
};

type EnEntemplateZhtemplate = {
  [state: string]: string;
};

export const mapEntemplate2Zhtemplate: EnEntemplateZhtemplate = {
  TextClassification: "文本分类",
  ImagesClassification: "图片分类",
  FaceTag: "骨骼打点",
  ImageFrame: "图片框选",
  SoundTag: "音频标注",
  VideoTag: "视频标注",
  TextReview: "文本审核",
  ImageReview: "图片审核",
  VideoReview: "视频审核",
  AudioReview: "音频审核",
  TextTriple: "文字三元组",
  SentenceSort: "乱序重排",
  Custom: "自定义模板",
};

type Role2En = {
  [state: string]: string;
};

export const mapRole2En: Role2En = {
  demander: "需求方",
  labeler: "标注方",
  administrator: "管理员",
  agent: "中介",
};

type Level2Exp = {
  [state: string]: number;
};

export const mapLevel2Exp: Level2Exp = {
  bronze: 200,
  silver: 500,
  gold: 1000,
  diamond: 1000,
};

type Level2Zh = {
  [state: string]: { name: string; color: string };
};

export const mapLevel2Zh: Level2Zh = {
  bronze: { name: "青铜", color: "rgb(186, 110, 64)" },
  silver: { name: "白银", color: "rgb(233, 233, 216 )" },
  gold: { name: "黄金", color: "rgb(242, 192, 86 )" },
  diamond: { name: "钻石", color: "rgb(32, 108, 221)" },
};

type Entag2Zh = {
  [state: string]: string;
};

export const mapTag2Zh: Entag2Zh = {
  sentiment: "情感分类/分析",
  "part-of-speech": "词性分类",
  intent: "意图揣测",
  event: "事件概括",
};

export interface Announcement {
  announce_id?: number;
  admin_name: string;
  key: boolean;
  label: Label;
  text: string;
  time: number;
  title: string;
}

export enum Label {
  All = "all",
  Block = "block", // 封禁公告
  Maintain = "maintain", // 维护公告
  Other = "other", // 其他公告
  Update = "update", // 更新公告
}

export interface LabelMap {
  [key: string]: {
    name: string;
    color: string;
  };
}
export const mapLabel: LabelMap = {
  block: { name: "封禁公示", color: "rgb(255, 102, 102)" }, // Red color for 封禁公告
  maintain: { name: "维护公告", color: "rgb(255, 204, 0)" }, // Yellow color for 维护公告
  other: { name: "其他公告", color: "rgb(51, 153, 255)" }, // Green color for 其他公告
  all: { name: "所有公告", color: "rgb(0, 128, 0)" }, // Green color for 所有公告
  update: { name: "更新公告", color: "rgb(102, 204, 0)" }, // Blue color for 更新公告
};

type LS2CN = {
  [state: number]: {name: string, color: string};
};

export const mapLS2CN: LS2CN = {
  0: {name: "空闲", color: "rgb(51, 153, 255)"},
  1: {name: "已分发", color: "rgb(160, 227, 109)"},
  2: {name: "标注中", color: "rgb(33, 198, 198)"},
};