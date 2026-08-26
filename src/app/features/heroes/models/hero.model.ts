export interface Hero {
  readonly id: string;
  name: string;
  realName: string;
  link?: string;
  imageUrl: string;
}

export type CreateHero = Omit<Hero, 'id'>;
export type UpdateHero = Partial<Hero>;