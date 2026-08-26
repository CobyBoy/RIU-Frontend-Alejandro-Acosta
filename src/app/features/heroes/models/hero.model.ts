export interface Hero {
  readonly id: number;
  name: string;
  realName: string;
  link: string;
  imgUrl?: string;
}

export type CreateHero = Omit<Hero, 'id'>;
