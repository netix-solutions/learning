export type RewardTheme = 'garden' | 'train' | 'dinosaurs' | 'bakery';
export type TrainCarId = 'passenger' | 'cargo' | 'aquarium' | 'garden' | 'observatory' | 'caboose';
export type DinosaurId = "triceratops" | "stegosaurus" | "brachiosaurus" | "parasaurolophus" | "ankylosaurus" | "tyrannosaurus";
export type BakeryTreatId = "donut" | "cupcake" | "cakepop" | "cookie" | "croissant" | "macarons";
export type TrainState = { bakeryCatalog?: {id:BakeryTreatId;name:string;price:number;sort:number}[]; treats?: {id:string;treatId:BakeryTreatId}[]; dinosaurCatalog?: {id:DinosaurId;name:string;price:number;sort:number}[]; dinosaurs?: {id:string;dinosaurId:DinosaurId}[]; theme: RewardTheme; earned: number; spent: number; balance: number; catalog: { id: TrainCarId; name: string; price: number; sort: number }[]; cars: {id: string; carId: TrainCarId; position: number}[] };
