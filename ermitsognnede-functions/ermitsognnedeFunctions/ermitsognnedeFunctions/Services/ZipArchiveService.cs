using ermitsognnedeFunctions.Models;
using ermitsognnedeFunctions.Services.Interfaces;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;

namespace ermitsognnedeFunctions.Services
{
    public class ZipArchiveService : IZipArchiveService
    {
        public async Task<FileModel> GetDistictData(Stream zipArchiveStream)
        {

            var memStream = new MemoryStream();

            using (var archive = new ZipArchive(zipArchiveStream))
            {
                var districtEntry = archive.Entries.FirstOrDefault(x => x.Name.Contains("sognedata-covid-19"));
                if (districtEntry == null)
                    districtEntry = archive.Entries.FirstOrDefault(x => x.Name.Contains("sognedata"));

                await districtEntry.Open().CopyToAsync(memStream);
                return new FileModel
                {
                    FileName = districtEntry.FullName,
                    Stream = memStream
                };
            }
        }
    }
}
