interface ItemCountProps {
    count: number;
}

const ItemCount = ({ count }: ItemCountProps) => {
    return (
        <span className="bg-primary/10 text-primary text-sm font-medium px-2.5 py-0.5 rounded-full mt-1">{count}</span>
    );
};
export default ItemCount;
