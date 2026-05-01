interface OwnTaskBadgeProps {
    text: string;
}

const OwnTaskBadge = ({ text }: OwnTaskBadgeProps) => {
    return (
        <span className="absolute top-[-8px] left-[-8px] inline-flex items-center rounded bg-honor-purple/90 px-2 py-1 text-xs font-medium text-white">
            {text}
        </span>
    );
};

export default OwnTaskBadge;
