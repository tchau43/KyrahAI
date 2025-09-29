import { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
  fill?: string;
  stroke?: string;
};

export interface Populate {
  path: string;
  select: string;
}

export interface Thumbnail {
  _id: string;
  path: string;
  name: string;
}

export interface Pagination {
  limit: number;
  nextCursor: string;
  totalRecord: number;
  totalPage: number;
}
