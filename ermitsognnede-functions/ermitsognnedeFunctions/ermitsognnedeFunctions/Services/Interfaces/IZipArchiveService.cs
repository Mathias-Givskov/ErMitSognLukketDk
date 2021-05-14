using ermitsognnedeFunctions.Models;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace ermitsognnedeFunctions.Services.Interfaces
{
    public interface IZipArchiveService
    {
        Task<List<FileModel>> GetDistictData(Stream zipArchiveStream);
    }
}
