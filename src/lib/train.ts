export type RewardTheme = 'garden' | 'train';
export type TrainCarId = 'passenger' | 'cargo' | 'aquarium' | 'garden' | 'observatory' | 'caboose';
export type TrainState = { theme: RewardTheme; earned: number; spent: number; balance: number; catalog: { id: TrainCarId; name: string; price: number; sort: number }[]; cars: {id: string; carId: TrainCarId; position: number}[] };
