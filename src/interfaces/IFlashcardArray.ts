
export default interface FlashcardArrayProps {
  cards: Array<{
    id: number;
    frontHTML: string | JSX.Element;
    backHTML: string | JSX.Element;
    frontCardStyle?: React.CSSProperties;
    frontContentStyle?: React.CSSProperties;
    backCardStyle?: React.CSSProperties;
    backContentStyle?: React.CSSProperties;
    className?: string;
    height?: string;
    width?: string;
    borderRadius?: string;
    style?: React.CSSProperties;
    isRemembered?: boolean;
    mark?: boolean;
    initialContent?:string
    img?:string;
    video?: string;
    srsState?: string;
  }>;
  controls?: boolean;
  forwardRef?: React.MutableRefObject<{
    nextCard: () => void;
    prevCard: () => void;
    resetArray: () => void;
  } | null>;
  showCount?: boolean;
  frontCardStyle?: React.CSSProperties;
  frontContentStyle?: React.CSSProperties;
  backCardStyle?: React.CSSProperties;
  backContentStyle?: React.CSSProperties;
  FlashcardArrayStyle?: React.CSSProperties;
  onCardChange?: (id: number, index: number) => void;
  onCardFlip?: (id: number, index: number, state: boolean) => void;
  currentCardFlipRef?: React.MutableRefObject<() => void> | { current: null };
  cycle?: boolean;
  onStudy?: boolean;
  onSpaceRepetition?: boolean;
  spaceRepetitionSetting?: object;
  minimize?: () => void;
  maximize?: () => void;
  onProgressStudy?: (newRemember: number, newRecall: number) => void;
  onUpdateCards?: (newCards: object[]) => void;
  onSound?: (content:string) => void;
  styleProgress?: React.CSSProperties;
  heightCard?: string;
  widthCard?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canFavorite?: boolean;
  flipped?: boolean;
  cardIndex?: number;
  setId?: number;
  onCardStatusChange ?:(idCard:number,statusProgress:boolean) => void;
  onChangedMark?: (index: number, marked: boolean) => void;
  onRandom?: () => void;
  onResetCard?: () => void;
  share?: () => void;
  onDeleteSet?: () => void;
  onSrsSubmitCard?: (cardId: any, rating: string) => void;
  onSrsCommitDone?: (setId: any) => void;
}
