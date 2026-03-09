import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Loader2, MapPin, Upload } from 'lucide-react';
import { PARTIES } from '@/constants/parties';

interface RepresentativeDetailsProps {
    formData: {
        position: string;
        party: string;
        district: string;
        bio: string;
        idCard: File | null;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSelectChange: (name: string, value: string) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    goBack: () => void;
    isLoading: boolean;
}

const RepresentativeDetails = ({
    formData,
    handleChange,
    handleSelectChange,
    handleFileChange,
    handleSubmit,
    goBack,
    isLoading,
}: RepresentativeDetailsProps) => {
    // Function to clear the file input
    const clearFileInput = () => {
        // Create a new FileList-like object with no files
        const dataTransfer = new DataTransfer();

        // Create a real input element to dispatch a change event from
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.files = dataTransfer.files;

        // Use the actual handleFileChange with a real change event
        handleFileChange({
            target: fileInput,
        } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="honor-card">
            <h2 className="text-xl font-bold mb-6">Информация о представителе</h2>

            <div className="mb-6">
                <Label
                    htmlFor="position"
                    className="block mb-2">
                    Должность
                </Label>
                <div className="relative">
                    <Building
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                        size={18}
                    />
                    <Input
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="honor-input pl-10"
                        placeholder="Депутат городской думы"
                        required
                    />
                </div>
            </div>

            <div className="mb-6">
                <Label
                    htmlFor="party"
                    className="block mb-2">
                    Политическая партия
                </Label>
                <Select
                    defaultValue={formData.party}
                    onValueChange={(value) => handleSelectChange('party', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите партию" />
                    </SelectTrigger>
                    <SelectContent>
                        {PARTIES.map((party) => (
                            <SelectItem
                                key={party.value}
                                value={party.value}>
                                {party.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="mb-6">
                <Label
                    htmlFor="district"
                    className="block mb-2">
                    Избирательный округ/Район
                </Label>
                <div className="relative">
                    <MapPin
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                        size={18}
                    />
                    <Input
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="honor-input pl-10"
                        placeholder="Округ №1 / Ленинский район"
                        required
                    />
                </div>
            </div>

            <div className="mb-6">
                <Label
                    htmlFor="bio"
                    className="block mb-2">
                    О себе
                </Label>
                <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="honor-input min-h-[100px]"
                    placeholder="Кратко расскажите о себе и своей деятельности..."
                    required
                />
            </div>

            <div className="mb-6">
                <Label
                    htmlFor="idCard"
                    className="block mb-2">
                    Загрузите удостоверение
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    {formData.idCard ? (
                        <div>
                            <p className="font-medium text-honor-blue mb-2">{formData.idCard.name}</p>
                            <p className="text-sm text-honor-darkGray">
                                {(formData.idCard.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-2"
                                onClick={clearFileInput}>
                                Заменить файл
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Upload
                                className="mx-auto mb-2 text-honor-darkGray"
                                size={32}
                            />
                            <p className="text-honor-darkGray mb-2">Перетащите файл сюда или нажмите для выбора</p>
                            <Input
                                id="idCard"
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={handleFileChange}
                                // required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="text-honor-blue"
                                onClick={() => document.getElementById('idCard')?.click()}>
                                Выбрать файл
                            </Button>
                        </>
                    )}
                </div>
                <p className="text-xs text-honor-darkGray mt-2">
                    Загрузите скан или фото удостоверения для верификации вашего аккаунта. Допустимые форматы: JPG, PNG,
                    PDF. Максимальный размер: 5MB.
                </p>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full honor-button-primary mb-4">
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : 'Отправить заявку'}
            </Button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={goBack}
                    className="text-honor-blue hover:underline">
                    Вернуться назад
                </button>
            </div>
        </form>
    );
};

export default RepresentativeDetails;
