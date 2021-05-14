using System.IO;

namespace ermitsognnedeFunctions.Models
{
    public enum FileDataType
    {
        DistrictData,
        Municipality
    }

    public class FileModel
    {
        public FileDataType FileDataType { get; set; }
        public string FileName { get; set; }
        public Stream Stream { get; set; }
    }
}
